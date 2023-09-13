import React, { useState, useCallback } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useDropzone } from "react-dropzone";
import { Button, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
const UploadFile = (props) => {
  const onDrop = useCallback((acceptedFiles) => {
    props.setUploadedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    setTimeout(() => {
      props.setIsFileUploadeToS3(true);
    }, 1000);
  };

  return (
    <>
      <Typography
        variant="h6"
        sx={{ marginBottom: "16px", textAlign: "center" }}
      >
        Drag and Drop or Select 1 File
      </Typography>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          borderRadius: "5px",
          minHeight: "150px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography variant="body1">Drop the files here ...</Typography>
        ) : (
          <CloudUploadIcon />
        )}
      </div>
    </>
  );
};
export default UploadFile;
