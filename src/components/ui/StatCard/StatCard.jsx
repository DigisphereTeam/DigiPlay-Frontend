import { Card } from "react-bootstrap";

import "./StatCard.css";

const StatCard = ({
  title,
  value,
  icon: Icon,
  //   iconBg = "#E6F4Fd",
  //   iconColor = "#057DCD",
}) => {
  return (
    <Card className="stat-card">
      <Card.Body>
        <div className="stat-card-header">
          <span>{title}</span>

          <div
            className="stat-card-icon"
            // style={{
            //   background: iconBg,
            //   color: iconColor,
            // }}
          >
            {Icon && <Icon />}
          </div>
        </div>

        <h3>{value}</h3>
      </Card.Body>
    </Card>
  );
};

export default StatCard;
