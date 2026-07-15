/*!

=========================================================
* Vision UI Free React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-react/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import { useState, useEffect } from "react";

import { useLocation } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";

// Vision UI Dashboard React example components
import Breadcrumbs from "examples/Breadcrumbs";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Vision UI Dashboard React context
import {
  useVisionUIController,
  setTransparentNavbar,
  setMiniSidenav,
} from "context";



function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useVisionUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar } = controller;
  const route = useLocation().pathname.split("/").slice(1);
  const [timeString, setTimeString] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeString(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
    >
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.7); }
          70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 6px rgba(0, 242, 254, 0); }
          100% { transform: scale(0.95); opacity: 0.8; box-shadow: 0 0 0 0 rgba(0, 242, 254, 0); }
        }
      `}</style>
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <VuiBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </VuiBox>
        {isMini ? null : (
          <VuiBox sx={(theme) => navbarRow(theme, { isMini })}>
            <VuiBox color={light ? "white" : "inherit"} display="flex" alignItems="center">
              {/* Desktop-only status indicators */}
              <VuiBox display={{ xs: "none", md: "flex" }} alignItems="center" gap={2} mr={2}>
                {/* Live Clock */}
                <VuiBox
                  display="flex"
                  alignItems="center"
                  px={2}
                  py={0.75}
                  sx={{
                    background: "rgba(6, 11, 40, 0.74)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(226, 232, 240, 0.1)",
                    borderRadius: "20px",
                  }}
                >
                  <span style={{ fontSize: "12px", marginRight: "6px" }}>🕒</span>
                  <VuiTypography variant="button" color="white" fontWeight="medium" fontSize={11}>
                    {timeString}
                  </VuiTypography>
                </VuiBox>

                {/* System Status Pill */}
                <VuiBox
                  display="flex"
                  alignItems="center"
                  px={2}
                  py={0.75}
                  sx={{
                    background: "rgba(6, 11, 40, 0.74)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(226, 232, 240, 0.1)",
                    borderRadius: "20px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#00f2fe",
                      boxShadow: "0 0 8px #00f2fe",
                      marginRight: "8px",
                      animation: "pulse 2s infinite"
                    }}
                  />
                  <VuiTypography variant="button" color="white" fontWeight="medium" fontSize={11} letterSpacing={1}>
                    SYSTEM ONLINE
                  </VuiTypography>
                </VuiBox>

                {/* Logo Badge */}
                <VuiBox
                  display="flex"
                  alignItems="center"
                  px={2}
                  py={0.75}
                  sx={{
                    background: "linear-gradient(135deg, rgba(0, 114, 255, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)",
                    border: "1px solid rgba(0, 242, 254, 0.2)",
                    borderRadius: "20px",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "6px" }}>
                    <rect width="32" height="32" rx="8" fill="url(#navLogoGrad)" />
                    <path d="M16 6C10.48 6 6 9.13 6 13C6 15.65 8.16 17.9 11.38 19.12C11.13 19.72 10.74 20.66 9.87 21.62C9.72 21.78 9.71 22.02 9.84 22.18C9.97 22.34 10.2 22.39 10.39 22.31C12.83 21.28 14.53 20.14 15.35 19.53C15.57 19.56 15.78 19.58 16 19.58C21.52 19.58 26 16.45 26 12.58C26 8.71 21.52 6 16 6ZM16 17.58C11.58 17.58 8 15.34 8 12.58C8 9.82 11.58 7.58 16 7.58C20.42 7.58 24 9.82 24 12.58C24 15.34 20.42 17.58 16 17.58Z" fill="white" />
                    <circle cx="16" cy="12.5" r="2.5" fill="#00f2fe" />
                    <defs>
                      <linearGradient id="navLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0072ff" />
                        <stop offset="1" stopColor="#00f2fe" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <VuiTypography variant="button" color="white" fontWeight="bold" fontSize={11}>
                    FIFA command center
                  </VuiTypography>
                </VuiBox>
              </VuiBox>
              <IconButton
                size="small"
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
                aria-label="Toggle navigation menu"
              >
                <Icon className={"text-white"}>{miniSidenav ? "menu_open" : "menu"}</Icon>
              </IconButton>
            </VuiBox>
          </VuiBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
