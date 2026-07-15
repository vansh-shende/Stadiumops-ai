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

import { useEffect } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";

// Vision UI Dashboard React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavCard from "examples/Sidenav/SidenavCard";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Vision UI Dashboard React context
import { useVisionUIController, setMiniSidenav, setTransparentSidenav } from "context";

// Vision UI Dashboard React icons
import SimmmpleLogo from "examples/Icons/SimmmpleLogo";

// function Sidenav({ color, brand, brandName, routes, ...rest }) {
function Sidenav({ color, brandName, routes, location, ...rest }) {
  const [controller, dispatch] = useVisionUIController();
  const { miniSidenav, transparentSidenav } = controller;
  const { pathname } = location;
  const collapseName = pathname.split("/").slice(1)[0];

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  useEffect(() => {
    if (window.innerWidth < 1440) {
      setTransparentSidenav(dispatch, false);
    }
  }, []);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes.map(({ type, name, icon, title, noCollapse, key, route, href }) => {
    let returnValue;

    if (type === "collapse") {
      returnValue = href ? (
        <ListItem key={key} disablePadding sx={{ display: "block" }}>
          <Link
            href={href}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none", width: "100%", display: "block" }}
          >
            <SidenavCollapse
              color={color}
              name={name}
              icon={icon}
              active={key === collapseName}
              noCollapse={noCollapse}
            />
          </Link>
        </ListItem>
      ) : (
        <ListItem key={key} disablePadding sx={{ display: "block" }}>
          <NavLink to={route} style={{ textDecoration: "none", width: "100%", display: "block" }}>
            <SidenavCollapse
              color={color}
              key={key}
              name={name}
              icon={icon}
              active={key === collapseName}
              noCollapse={noCollapse}
            />
          </NavLink>
        </ListItem>
      );
    } else if (type === "title") {
      returnValue = (
        <VuiTypography
          key={key}
          color="white"
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </VuiTypography>
      );
    } else if (type === "divider") {
      returnValue = <Divider light key={key} />;
    }

    return returnValue;
  });

  return (
    <SidenavRoot {...rest} variant="permanent" ownerState={{ transparentSidenav, miniSidenav }}>
      <VuiBox
        pt={3.5}
        pb={0.5}
        px={4}
        textAlign="center"
        sx={{
          overflow: "unset !important",
        }}
      >
        <VuiBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <VuiTypography variant="h6" color="text">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </VuiTypography>
        </VuiBox>
        <VuiBox component={NavLink} to="/" display="flex" alignItems="center">
          <VuiBox
            sx={(theme) => ({
              ...sidenavLogoLabel(theme, { miniSidenav }),
              display: "flex",
              alignItems: "center",
              margin: "0 auto",
            })}
          >
            <VuiBox
              display="flex"
              sx={(theme) => ({
                ...sidenavLogoLabel(theme, { miniSidenav, transparentSidenav }),
                mr: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : 1.5,
                alignItems: "center",
              })}
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <style>{`
                  @keyframes pulseNode {
                    0% { r: 2; opacity: 0.6; }
                    50% { r: 3.5; opacity: 1; filter: drop-shadow(0 0 3px #00f2fe); }
                    100% { r: 2; opacity: 0.6; }
                  }
                  @keyframes rotateRing {
                    0% { transform: rotate(0deg); transform-origin: 16px 12.5px; }
                    100% { transform: rotate(360deg); transform-origin: 16px 12.5px; }
                  }
                  @keyframes scanLine {
                    0% { transform: translateY(-3.5px); opacity: 0.3; }
                    50% { transform: translateY(3.5px); opacity: 0.8; }
                    100% { transform: translateY(-3.5px); opacity: 0.3; }
                  }
                  .pulsing-node {
                    animation: pulseNode 2s infinite ease-in-out;
                  }
                  .rotating-ring {
                    animation: rotateRing 8s infinite linear;
                  }
                  .scanning-line {
                    animation: scanLine 3s infinite ease-in-out;
                  }
                `}</style>
                <rect width="32" height="32" rx="8" fill="url(#fifaLogoGrad)" />
                <path d="M16 6C10.48 6 6 9.13 6 13C6 15.65 8.16 17.9 11.38 19.12C11.13 19.72 10.74 20.66 9.87 21.62C9.72 21.78 9.71 22.02 9.84 22.18C9.97 22.34 10.2 22.39 10.39 22.31C12.83 21.28 14.53 20.14 15.35 19.53C15.57 19.56 15.78 19.58 16 19.58C21.52 19.58 26 16.45 26 12.58C26 8.71 21.52 6 16 6ZM16 17.58C11.58 17.58 8 15.34 8 12.58C8 9.82 11.58 7.58 16 7.58C20.42 7.58 24 9.82 24 12.58C24 15.34 20.42 17.58 16 17.58Z" fill="white" />
                <g className="rotating-ring">
                  <ellipse cx="16" cy="12.5" rx="5" ry="2" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="0.8" />
                  <circle cx="11" cy="12.5" r="1.2" fill="#00f2fe" />
                  <circle cx="21" cy="12.5" r="1.2" fill="#00f2fe" />
                </g>
                <circle cx="16" cy="12.5" r="2.5" fill="#00f2fe" className="pulsing-node" />
                <line x1="9" y1="12.5" x2="23" y2="12.5" stroke="#00f2fe" strokeWidth="1" className="scanning-line" strokeLinecap="round" />
                <defs>
                  <linearGradient id="fifaLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0f2027" />
                    <stop offset="0.5" stopColor="#203a43" />
                    <stop offset="1" stopColor="#2c5364" />
                  </linearGradient>
                </defs>
              </svg>
            </VuiBox>
            <VuiTypography
              variant="button"
              textGradient={true}
              color="logo"
              fontSize={14}
              letterSpacing={1.2}
              fontWeight="bold"
              sx={(theme) => ({
                ...sidenavLogoLabel(theme, { miniSidenav, transparentSidenav }),
                opacity: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : 1,
                maxWidth: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : "100%",
                margin: "0 auto",
                textTransform: "none",
              })}
            >
              {brandName}
            </VuiTypography>
          </VuiBox>
        </VuiBox>
      </VuiBox>
      <Divider light />
      <List>{renderRoutes}</List>
      <VuiBox
        my={2}
        mx={2}
        mt="auto"
        sx={({ breakpoints }) => ({
          [breakpoints.up("xl")]: {
            pt: 2,
          },
          [breakpoints.only("xl")]: {
            pt: 1,
          },
          [breakpoints.down("xl")]: {
            pt: 2,
          },
        })}
      >
        {/* Clean sidebar footer */}
      </VuiBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  // brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  // brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  location: PropTypes.object.isRequired,
};

export default Sidenav;
