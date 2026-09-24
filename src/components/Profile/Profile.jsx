import { useState, useEffect } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";

import { getProfile } from "../../services/profileService";
import { initialsFromName } from "../../utils/initialsFromName";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    designation: "",
    phone: "",
    email: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch logged-in user profile details on mount
  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await getProfile();
        if (isMounted && response?.data) {
          const userData = response.data;

          // Map API payload fields to component state
          setProfile({
            name: userData.full_name || "",
            designation: userData.role || "",
            phone: userData.phone_number || "",
            email: userData.email || "",
          });
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error?.response?.data?.message || "Failed to load profile details",
          );
        }
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (profileLoading) {
    return (
      <div className="ui-common-loader">
        <ThreeDots height="20" width="50" color="#057DCD" ariaLabel="loading" />
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-page-header">
        <div>
          <h2 className="profile-page-title">My Profile</h2>
          <p className="profile-page-subtitle">
            View your personal information
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="profile-page-card">
        <Card.Body className="profile-page-card-body">
          {/* Avatar */}
          <div className="profile-page-avatar-section">
            <div className="profile-page-avatar-wrapper">
              <div className="profile-page-avatar">
                {initialsFromName(profile.name) || "U"}
              </div>
            </div>

            <div className="profile-page-user-details">
              <h4 className="profile-page-user-details-h4">{profile.name}</h4>

              <span className="profile-page-user-details-span">
                {profile.designation}
              </span>
            </div>
          </div>

          {/* Form / Details (Read-Only Inputs) */}
          <Row className="g-3 g-lg-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-card-form-label">
                  Full Name
                </Form.Label>

                <Form.Control
                  className="profile-card-form-control"
                  type="text"
                  name="name"
                  value={profile.name}
                  readOnly
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-card-form-label">
                  Designation / Role
                </Form.Label>

                <Form.Control
                  className="profile-card-form-control"
                  type="text"
                  name="designation"
                  value={profile.designation}
                  readOnly
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-card-form-label">
                  Mobile Number
                </Form.Label>

                <Form.Control
                  className="profile-card-form-control"
                  type="text"
                  name="phone"
                  value={profile.phone}
                  readOnly
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-card-form-label">
                  Email Address
                </Form.Label>

                <Form.Control
                  className="profile-card-form-control"
                  type="email"
                  name="email"
                  value={profile.email}
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;
