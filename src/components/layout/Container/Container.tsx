import React from "react";
import styles from "./Container.module.css";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
  noPadding?: boolean;
}

export const Container = ({
  children,
  className = "",
  fluid = false,
  noPadding = false,
}: ContainerProps) => {
  const containerClasses = [
    styles.container,
    fluid ? styles.fluid : "",
    noPadding ? styles.noPadding : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return <div className={containerClasses}>{children}</div>;
};
