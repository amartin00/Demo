import { useState, useEffect } from "react";
import "./UploadResume.css";
import { extractTextFromFile } from "../utils/fileParser";
import { calculateTextMatch } from "../utils/textComparison";

const UploadResume = () => {
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [matchPercentage, setMatchPercentage] = useState(null);

  useEffect(() => {
    const storedResume = localStorage.getItem("resume");
    if (storedResume) {
      const parsedResume = JSON.parse(storedResume);
      setResume(parsedResume);
    }
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only PDF, DOC, and DOCX are allowed.");
      setMessage("");
      return;
    }

    if (file.size > maxSize) {
      setError("File size exceeds 5MB limit.");
      setMessage("");
      return;
    }

    setError("");
    try {
      const extractedText = await extractTextFromFile(file);

      // Create a Blob URL for preview
      const fileURL = URL.createObjectURL(file);

      const fileData = {
        name: file.name,
        content: extractedText, // Extracted text for text comparison
        previewUrl: fileURL, // Blob URL for file preview
        type: file.type,
      };

      // Save in local storage
      localStorage.setItem("resume", JSON.stringify(fileData));

      // ✅ Update the state
      setResume(fileData);
      setMessage("Resume uploaded successfully!");
    } catch (err) {
      console.error("Error extracting text:", err);
      setError("Failed to extract text from the resume.");
    }
  };

  const handleRemoveResume = () => {
    if (resume?.previewUrl) {
      URL.revokeObjectURL(resume.previewUrl); // Revoke Blob URL
    }

    // Clear local storage and state
    localStorage.removeItem("resume");
    setResume(null);
    setMessage("Resume removed successfully.");
    setMatchPercentage(null);
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleCompare = () => {
    if (!resume || !jobDescription) {
      setError("Please upload a resume and enter a job description.");
      return;
    }

    const matchScore = calculateTextMatch(resume.content, jobDescription); // Ensure this returns a number
    const formattedMatch = calculateMatch(matchScore);

    setMatchPercentage(formattedMatch);
  };

  function calculateMatch(match) {
    if (typeof match !== "number" || isNaN(match)) {
      console.error("Invalid match value:", match);
      return "N/A"; // Or return 0 if needed
    }
    return match.toFixed(2);
  }

  return (
    <div>
      <div className="container">
        <div className="resume-container">
          <h2 className="upload-title">Upload Your Resume</h2>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="upload-input"
          />
          {error && <p className="upload-error">{error}</p>}
          {message && <p className="upload-message">{message}</p>}
          {resume && (
            <div className="resume-preview">
              <p>
                <strong>Uploaded:</strong> {resume.name}
              </p>
              <a
                href={resume.content}
                download={resume.name}
                className="download-link"
              >
                Download Resume
              </a>
              <button onClick={handleRemoveResume} className="remove-button">
                Remove Resume
              </button>
              {resume.type === "application/pdf" && (
                <iframe
                  src={resume.previewUrl}
                  width="100%"
                  height="400px"
                  title="Resume Preview"
                  className="resume-frame"
                ></iframe>
              )}
            </div>
          )}
        </div>
        <div className="job-container">
          <h3 className="job-description-title">Paste Job Description</h3>
          <textarea
            className="job-description-input"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={handleJobDescriptionChange}
          />
        </div>
      </div>
      <div className="results-container">
        <button onClick={handleCompare} className="compare-button">
          Compare
        </button>
        {matchPercentage !== null && (
          <p
            className="match-result"
            style={{ color: matchPercentage >= 50 ? "green" : "red" }}
          >
            Match Percentage: {matchPercentage}%
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadResume;
