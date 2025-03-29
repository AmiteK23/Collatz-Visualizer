import React from "react";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  // Limit the number of items shown in the tooltip to 5
  const limitedPayload = payload.slice(0, 5);
  const hasMore = payload.length > 5;

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
        maxWidth: "250px",
      }}
    >
      <p style={{ margin: "0 0 5px", fontWeight: "bold" }}>Step: {label}</p>
      {limitedPayload.map((entry, index) => (
        <div
          key={`item-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            margin: "3px 0",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              marginRight: "5px",
              backgroundColor: entry.color,
              borderRadius: "50%",
            }}
          />
          <span style={{ fontSize: "0.8rem" }}>
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
      {hasMore && (
        <p
          style={{
            margin: "5px 0 0",
            fontSize: "0.8rem",
            fontStyle: "italic",
            color: "#666",
          }}
        >
          +{payload.length - 5} more...
        </p>
      )}
    </div>
  );
};

export default CustomTooltip;
