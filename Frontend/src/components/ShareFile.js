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
  Backdrop,
  CircularProgress,
  Modal,
} from "@mui/material";
import axios from "axios";
import sensitiveDataImage from "../assets/sensitive.png";
import successImage from "../assets/success.jpg";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { green } from "@mui/material/colors";
import { CopyToClipboard } from "react-copy-to-clipboard";

const API_URL = process.env.REACT_APP_API_ENDPOINT_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

const modalStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const paperStyle = {
  backgroundColor: "#fff",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  padding: "16px 32px",
  textAlign: "center",
  maxWidth: 600,
  borderRadius: "20px",
};

const imageStyle = {
  width: "50%",
  marginBottom: 16,
};

const SensitiveDataModal = ({
  openSensitiveDataModal,
  setOpenSensitiveDataModal,
}) => {
  return (
    <Modal
      open={openSensitiveDataModal}
      onClose={() => {
        setOpenSensitiveDataModal(false);
      }}
      style={modalStyle}
    >
      <div style={paperStyle}>
        <img src={sensitiveDataImage} alt="Sensitive Data" style={imageStyle} />
        <Typography variant="h5" component="h2" gutterBottom>
          This file contains sensitive data and cannot be shared. Admin has been
          notified about this action.
        </Typography>
        {/* <Typography variant="body1">
          Please handle it with utmost care and ensure it is not accessible to
          unauthorized individuals. Try sharing the file again without any
          sensitive data.
        </Typography> */}
        <Button
          variant="outlined"
          onClick={() => {
            setOpenSensitiveDataModal(false);
          }}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

const SuccessModal = ({ openSuccessModal, setOpenSuccessModal, fileUrl }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(fileUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const onClick = React.useCallback(() => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, []);
  const onCopy = React.useCallback(() => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, []);

  return (
    <Modal
      open={openSuccessModal}
      onClose={() => {
        setOpenSuccessModal(false);
      }}
      style={modalStyle}
    >
      <div style={paperStyle}>
        <img src={successImage} alt="Success" style={imageStyle} />
        <Typography variant="h5" component="h2" gutterBottom>
          The file is uploaded successfully!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Here's the{" "}
          <a
            href={fileUrl}
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
            target="_blank"
          >
            URL
          </a>{" "}
          <br />
          Please make sure to share the file only with authorized people.
        </Typography>
        <TextField
          value={fileUrl}
          variant="outlined"
          lable="URL"
          style={{ width: "50%", marginTop: "20px", marginBottom: "20px" }}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <CopyToClipboard onCopy={onCopy} text={fileUrl}>
                <IconButton
                  onClick={onClick}
                  aria-label="Copy to clipboard"
                  style={{ color: copied ? green[500] : "inherit" }}
                >
                  <FileCopyIcon />
                </IconButton>
              </CopyToClipboard>
            ),
          }}
        />
        <br />
        <Button
          variant="outlined"
          onClick={() => {
            setOpenSuccessModal(false);
          }}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

const ShareFile = (props) => {
  const [expirationTime, setExpirationTime] = useState(null);
  const [userId, setUserId] = useState(null);
  // const [shareButtonClicked, setShareButtonClicked] = useState(false);
  const [backdrop, setBackdrop] = useState(false);

  const [responseData, setResponseData] = useState(null);
  const [openSensitiveDataModal, setOpenSensitiveDataModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const handleOriginalFileDownload = () => {
    const url = URL.createObjectURL(props.uploadedFile);

    const link = document.createElement("a");
    link.href = url;
    link.download = props.uploadedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleShareFile = async () => {
    setBackdrop(true);
    let data = await getBase64(props.uploadedFile);
    // console.log(data);
    if (data) {
      data = data.split(",")[1];
    }
    // console.log(data);
    try {
      const response = await axios.post(
        API_URL,
        {
          file_name: props.uploadedFile.name,
          expires_in: expirationTime.toString(),
          base64_data: data,
          user_id: userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
        }
      );
      console.log(response);
      setResponseData(response?.data);
      if (response) {
        if (response?.data?.statusCode === 400) {
          setOpenSensitiveDataModal(true);
        }
        if (response?.data?.statusCode === 200) {
          setOpenSuccessModal(true);
        }
      }

      setBackdrop(false);
    } catch (error) {
      setBackdrop(false);
      console.error("Error sharing the file:", error);
      alert("Error sharing the file. Please try again later.");
    }
  };
  return (
    <>
      <Typography variant="h4">Create a shareable url</Typography>
      {props.uploadedFile && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ marginTop: "16px" }}>
                Selected File:{" "}
                <a
                  onClick={() => {
                    handleOriginalFileDownload();
                  }}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  <u>{props.uploadedFile.name}</u>
                </a>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                value={expirationTime}
                label="Expiration Time (minutes)"
                variant="outlined"
                sx={{ width: "75%" }}
                type="number"
                onChange={(e) => {
                  setExpirationTime(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                value={userId}
                label="User Id"
                variant="outlined"
                sx={{ width: "75%" }}
                onChange={(e) => {
                  setUserId(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                sx={{ width: "75%" }}
                disabled={!expirationTime && !userId}
                onClick={() => {
                  handleShareFile();
                  // console.log();
                }}
              >
                Share File
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                sx={{ width: "75%" }}
                onClick={() => {
                  props.setUploadedFile(null);
                  // console.log();
                }}
              >
                CLEAR
              </Button>
            </Grid>
          </Grid>
        </>
      )}
      {
        <SensitiveDataModal
          openSensitiveDataModal={openSensitiveDataModal}
          setOpenSensitiveDataModal={setOpenSensitiveDataModal}
        />
      }
      {
        <SuccessModal
          openSuccessModal={openSuccessModal}
          setOpenSuccessModal={setOpenSuccessModal}
          fileUrl={responseData?.message}
        />
      }
      {backdrop && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={backdrop}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </>
  );
};

export default ShareFile;
