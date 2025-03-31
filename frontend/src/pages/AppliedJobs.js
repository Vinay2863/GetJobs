import React, { useEffect, useState, useContext } from "react";
import { logincontext } from "../contexts/Logincontext";
import axios from "axios";
import "./Connections.css";

const AppliedJobs = () => {
  const [currentuser] = useContext(logincontext);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("LoggedInUser"));
        const email = loggedInUser?.email;

        if (!email) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://127.0.0.1:5000/appliedjobs/${email}`);
        setAppliedJobs(response.data);
      } catch (err) {
        setError("Failed to fetch applied jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []); // ✅ No need to depend on currentuser.email

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applied jobs...</p>
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <div className="connections-container">
      <h1 className="connections-heading">Applied Jobs</h1>
      <div className="profile-cards">
        {appliedJobs.length > 0 ? (
          appliedJobs.map((job, index) => (
            <div key={index} className="profile-card">
              <h2>{job.company}</h2>
              <p><strong>Role:</strong> {job.role}</p>
            </div>
          ))
        ) : (
          <div>No jobs applied yet.</div>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;