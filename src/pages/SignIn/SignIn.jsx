import { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

import {
  // FaTrophy,
  FaShieldAlt,
  FaBolt,
  FaEye,
  FaEyeSlash,
  FaChartLine,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import { authService } from "../../services/authService";
import { saveToken } from "../../services/auth";

import logo from "../../assets/images/digi-play-logo.png";

import "./SignIn.css";

const SignIn = () => {
  const [signin, setSignin] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSigninSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: signin.email,
      password: signin.password,
    };

    setLoading(true);
    try {
      const response = await authService(payload);

      if (response.statusCode === 200) {
        // backend success message
        toast.success(response.message);

        // save token
        saveToken(response.data.token);

        localStorage.setItem("full_name", response.data.user.full_name);

        const role = response.data.user.role;

        if (role === "ADMIN") {
          navigate("/management/dashboard");
        } else if (role === "PRIMARY") {
          navigate("/management/player-management");
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Signin Error:", error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="signin-page">
      <Container>
        <Row className="signin-page-row">
          {/* LEFT SIDE */}
          <Col xs={12} md={6} className="signin-page-left-side">
            <div className="signin-page-logo-area">
              <div className="signin-page-logo-circle">
                <img src={logo} alt="KK Global Cricket Academy Logo" />
              </div>
            </div>

            <h1 className="signin-page-hero-title">
              Manage Your
              <br />
              <span> Sports Academy </span>
              Effortlessly
            </h1>

            <p className="signin-page-hero-text">
              {/* Complete academy management platform for coaches, students, and
              administrators. Track attendance, manage fees, and grow your
              academy. */}
              A complete sports academy management platform to manage players,
              coaches, attendance, fees, training schedules, and daily
              activities all in one place for a smoother, more organized
              academy.
            </p>

            <Row className="signin-page-feature-card-row g-3 align-items-stretch">
              <Col md={4}>
                <Card className="signin-page-feature-card">
                  <FaChartLine className="signin-page-icon" />

                  <h5>Growth</h5>

                  <p>Grow stronger</p>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="signin-page-feature-card">
                  <FaShieldAlt className="signin-page-icon" />

                  <h5>Secure</h5>

                  <p>Protected data</p>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="signin-page-feature-card">
                  <FaBolt className="signin-page-icon" />

                  <h5>Fast</h5>

                  <p>Lightning speed</p>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* RIGHT SIDE */}
          <Col xs={12} md={5} className="signin-page-right-side">
            <div className="signin-page-login-card">
              <h2>Welcome Back</h2>

              <p>Sign in to continue</p>

              <Form onSubmit={handleSigninSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="signin-page-form-label">
                    Email Address
                  </Form.Label>

                  <Form.Control
                    type="email"
                    name="email"
                    value={signin.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="signin-page-form-input"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="signin-page-form-label">
                    Password
                  </Form.Label>

                  <div className="signin-password-input-wrapper">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={signin.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="signin-page-form-input"
                    />

                    <span
                      className="signin-page-password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </Form.Group>

                <div className="signin-page-remember">
                  {/* <Form.Check
                    id="rememberMe"
                    label="Remember Me"
                    className="signin-page-remember-check"
                  />
                  <Link to="/" className="signin-page-anchor">
                    Forgot Password?
                  </Link> */}
                </div>

                <Button
                  type="submit"
                  className="signin-page-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <ThreeDots
                      height="20"
                      width="40"
                      color="#fff"
                      visible={true}
                    />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignIn;
