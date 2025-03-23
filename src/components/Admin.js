import React from "react";
import NavAdmin from "./NavAdmin";
import { Outlet } from "react-router-dom";
import { styled } from "@mui/material";

const Admin = () => {
  return (
    <StyledAdmin className="group_Admin">
      <div>
        <NavAdmin />
      </div>
      <div>
        <Outlet />
      </div>
    </StyledAdmin>
  );
};

const StyledAdmin = styled('div')`
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100vh;
`;

export default Admin;
