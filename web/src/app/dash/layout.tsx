"use client";

import Header from "@/components/dash/header";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default DashboardLayout;
