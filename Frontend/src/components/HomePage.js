import React, { useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  TextField,
  Grid,
  Paper,
  IconButton,
  Snackbar,
} from "@mui/material";
import MainImage from "../assets/main.png";
import LogoImage from "../assets/logo.png";
import UploadFile from "./UploadFile";
import ShareFile from "./ShareFile";
const HomePage = () => {
  // State to store uploaded file
  const [uploadedFile, setUploadedFile] = useState(null);
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ backgroundColor: "black" }}>
          <img
            src={LogoImage}
            alt="logo"
            style={{
              // marginTop: "10px",
              // marginBottom: "10px",
              height: "50px",
              width: "50px",
              paddingRight: "15px",
            }}
          />
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              //fontFamily: "monospace",
              fontWeight: 700,
              // letterSpacing: ".3rem",
              color: "white",
              textDecoration: "none",
              flexGrow: 1,
            }}
          >
            Cloud Share
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Grid
          container
          spacing={2}
          sx={{ marginTop: "30px", justifyContent: "center" }}
        >
          <Grid item xs={12} sx={{ marginBottom: "100px" }}>
            <Typography variant="h3" sx={{ textAlign: "center" }}>
              Cloud based File Sharing
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <img alt="img" src={MainImage} />
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: "center" }}>
            {uploadedFile ? (
              <ShareFile
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
              />
            ) : (
              <UploadFile
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
              />
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default HomePage;
