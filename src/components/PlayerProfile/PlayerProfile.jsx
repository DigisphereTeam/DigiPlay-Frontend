import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Card, Tabs, Tab } from "react-bootstrap";

import {
  FiArrowLeft,
  FiPhone,
  // FiMail,
  // FiBookOpen,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import { getPlayerById } from "../../services/playerService";
import { initialsFromName } from "../../utils/initialsFromName";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import "./PlayerProfile.css";

const formatCurrency = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number(value) === 0
  ) {
    return "-";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

const PlayerProfile = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();

  const [playerProfile, setPlayerProfile] = useState(null);
  const [isPlayersLoading, setIsPlayersLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await getPlayerById(playerId);

        if (response.statusCode === 200) {
          setPlayerProfile(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Get Player Error:", error);
        toast.error(error.response?.data?.message);
      } finally {
        setIsPlayersLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  if (isPlayersLoading) {
    return (
      <div className="ui-common-loader">
        <ThreeDots height="20" width="50" color="#057DCD" />
      </div>
    );
  }

  if (!playerProfile) {
    return null;
  }

  return (
    <div className="common-page-profile-container">
      {/* Back Button */}
      <button
        className="common-page-profile-back-button"
        onClick={() => navigate("/management/player-management")}
      >
        <FiArrowLeft />
        Back to Player
      </button>

      {/* Header Card */}
      <Card className="common-page-profile-header-card">
        <Card.Body className="common-page-profile-header-card-body">
          <div className="common-page-profile-header-wrapper">
            {/* Avatar */}
            <div className="common-page-profile-avatar">
              {initialsFromName(playerProfile.full_name)}
            </div>

            {/* Student Details */}
            <div className="student-profile-main-details">
              <div className="common-page-profile-name-row">
                <h2 className="common-page-profile-name">
                  {playerProfile.full_name}
                </h2>

                <span
                  className={
                    playerProfile.status === "Active"
                      ? "common-management-table-status-success"
                      : "common-management-table-status-danger"
                  }
                >
                  {playerProfile.status}
                </span>
              </div>

              <p className="common-page-profile-sub-title">
                {playerProfile.admission_id}
                {/* {" • "}
                {playerProfile.gender}
                {" • "}
                {playerProfile.date_of_birth} */}
              </p>

              <div className="common-page-contact-wrapper">
                <div className="common-page-profile-contact-item">
                  <FiPhone />
                  {playerProfile.phone_number || "-"}
                </div>

                {/* <div className="common-page-profile-contact-item">
                  <FiMail />
                  {playerProfile.email || "-"}
                </div>

                <div className="common-page-profile-contact-item">
                  <FiBookOpen />
                  {playerProfile.school || "-"}
                </div> */}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs defaultActiveKey="overview" className="student-profile-tabs">
        <Tab eventKey="overview" title="Overview">
          <Row className="student-profile-tabs-card-row">
            <ProfileCard title="Personal Details">
              <ProfileRow label="Age" value={playerProfile.age || "-"} />

              <ProfileRow label="Gender" value={playerProfile.gender || "-"} />

              <ProfileRow
                label="Date of Birth"
                value={playerProfile.date_of_birth || "-"}
              />

              <ProfileRow
                label="Address"
                value={playerProfile.address || "-"}
              />
            </ProfileCard>

            <ProfileCard title="Fee Profile">
              {/* <ProfileRow label="Batch" value={playerProfile.batch} /> */}

              <ProfileRow
                label="Admission Date"
                value={playerProfile.admission_date || "-"}
              />

              <ProfileRow
                label="Admission Fee"
                value={formatCurrency(playerProfile.admission_fee)}
              />

              <ProfileRow
                label="Regular Fee"
                value={formatCurrency(playerProfile.regular_fee)}
              />

              <ProfileRow
                label="Hostel Fee"
                value={formatCurrency(playerProfile.hostel_fee)}
              />
            </ProfileCard>

            <ProfileCard title="Fee Status">
              {/* <ProfileRow
                label="Admission Fee"
                value={formatCurrency(playerProfile.admission_fee)}
              />

              <ProfileRow
                label="Fee"
                value={formatCurrency(playerProfile.regular_fee)}
              /> */}

              <ProfileRow
                label="Payment Type"
                value={playerProfile.payment_type}
              />

              <ProfileRow label="Fee Status" value={playerProfile.fee_status} />
            </ProfileCard>
          </Row>
        </Tab>

        <Tab eventKey="parent" title="Parent & Emergency">
          <Row className="student-profile-tabs-card-row">
            <ProfileCard title="Parent Details" size={6}>
              <ProfileRow
                label="Father Name"
                value={playerProfile.father_name}
              />

              <ProfileRow
                label="Father Phone"
                value={playerProfile.father_phone}
              />

              <ProfileRow
                label="Occupation"
                value={playerProfile.father_occupation}
              />

              <ProfileRow
                label="Mother Name"
                value={playerProfile.mother_name}
              />

              <ProfileRow
                label="Mother Phone"
                value={playerProfile.mother_phone}
              />
            </ProfileCard>

            <ProfileCard title="Emergency Contact" size={6}>
              <ProfileRow label="Name" value={playerProfile.contact_name} />

              <ProfileRow label="Relation" value={playerProfile.relation} />

              <ProfileRow label="Phone" value={playerProfile.contact_phone} />
            </ProfileCard>
          </Row>
        </Tab>

        <Tab eventKey="medical" title="Medical Details">
          <Row className="student-profile-tabs-card-row">
            <ProfileCard title="Medical Information" size={6}>
              <ProfileRow
                label="Blood Group"
                value={playerProfile.blood_group}
              />
{/* 
              <ProfileRow label="Height" value={`${playerProfile.height} `} />

              <ProfileRow label="Weight" value={`${playerProfile.weight} kg`} />

              <ProfileRow label="Allergies" value={playerProfile.allergies} /> */}

              <ProfileRow label="Remarks" value={playerProfile.remarks} />
            </ProfileCard>
          </Row>
        </Tab>

        <Tab eventKey="documents" title="Documents">
          <Row className="student-profile-tabs-card-row">
            <ProfileCard title="Submitted Documents" size={12}>
              {playerProfile.document_urls?.length > 0 ? (
                playerProfile.document_urls.map((doc) => (
                  <div
                    className="student-profile-document-row"
                    key={doc.document_id}
                  >
                    <div className="student-profile-document-icon-wrapper">
                      <FiCheckCircle className="student-profile-document-icon text-success" />

                      {/* <span className="student-profile-tab-card-row-label">
                      Document
                    </span> */}

                      <button
                        type="button"
                        className="student-profile-document-link"
                        onClick={() => window.open(doc.file_url, "_blank")}
                      >
                        View Document
                      </button>
                    </div>

                    <span className="student-profile-document-badge uploaded">
                      Uploaded
                    </span>
                  </div>
                ))
              ) : (
                <div className="student-profile-document-row">
                  <FiAlertCircle className="student-profile-document-icon text-warning" />

                  <span className="student-profile-tab-card-row-label">
                    No Document Uploaded
                  </span>
                </div>
              )}
            </ProfileCard>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

const ProfileCard = ({ title, children, size = 4 }) => (
  <Col lg={size} className="mb-4">
    <Card className="student-profile-detail-tab-card">
      <Card.Header>{title}</Card.Header>

      <Card.Body>{children}</Card.Body>
    </Card>
  </Col>
);

const ProfileRow = ({ label, value }) => (
  <div className="student-profile-tab-card-row">
    <span className="student-profile-tab-card-row-label">{label}</span>

    <span className="student-profile-tab-card-row-value">{value || "-"}</span>
  </div>
);

export default PlayerProfile;
