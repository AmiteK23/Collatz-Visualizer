"use client";

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
        backgroundColor: "rgba(10, 15, 36, 0.95)",
        padding: "10px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "5px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
        maxWidth: "250px",
        color: "white",
      }}
    >
      <p style={{ margin: "0 0 5px", fontWeight: "bold", color: "white" }}>Step: {label}</p>
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
          <span style={{ fontSize: "0.8rem", color: "white" }}>
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
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          +{payload.length - 5} more...
        </p>
      )}
    </div>
  );
};

export default CustomTooltip;
