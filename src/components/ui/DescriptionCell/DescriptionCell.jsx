import { useEffect, useRef, useState } from "react";

import "./DescriptionCell.css";

const DescriptionCell = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const textRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (!textRef.current) return;

      setIsOverflowing(
        textRef.current.scrollHeight > textRef.current.clientHeight,
      );
    };

    checkOverflow();

    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [text]);

  if (!text || text === "-") {
    return <span>-</span>;
  }

  return (
    <div className="description-cell">
      <div
        ref={textRef}
        className={`description-cell-text ${
          expanded ? "description-cell-expanded" : ""
        }`}
      >
        {text}
      </div>

      {isOverflowing && (
        <button
          type="button"
          className="description-cell-toggle"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

export default DescriptionCell;