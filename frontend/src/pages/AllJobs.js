// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./Connections.css";

// const AllJobs = () => {
//     const [jobs, setJobs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchAppliedJobs = async () => {
//             try {
//                 const response = await axios.get("http://127.0.0.1:5000/alljobs");
//                 setJobs(response.data);
//             } catch (err) {
//                 console.error("Error fetching applied jobs:", err);
//                 if (err.response) {
//                     setError(`Error: ${err.response.status} - ${err.response.data.message}`);
//                 } else if (err.request) {
//                     setError("Error: No response from the server");
//                 } else {
//                     setError("Error: Failed to fetch applied jobs");
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAppliedJobs();
//     }, []);

//     if (loading) {
//         return (
//             <div className="loading-container">
//                 <div className="spinner"></div>
//                 <p>Loading applied jobs...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="error-container">
//                 <p className="text-red-500">{error}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6 max-w-6xl mx-auto">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">All Jobs</h2>
//             {jobs.length === 0 ? (
//                 <p className="text-gray-500 text-center">No job applications found.</p>
//             ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                     {jobs.map((job) => (
//                         <div key={job._id} className="p-4 border rounded-lg shadow-md bg-white">
//                             <h3 className="text-lg font-semibold text-blue-600">{job.email}</h3>
//                             <p><strong>{job.company}</strong></p>
//                             <p className="text-gray-600">{job.role}</p>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AllJobs;



import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AllJobs.css";

const AllJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/alljobs");
                setJobs(response.data);
            } catch (err) {
                console.error("Error fetching applied jobs:", err);
                if (err.response) {
                    setError(`Error: ${err.response.status} - ${err.response.data.message}`);
                } else if (err.request) {
                    setError("Error: No response from the server");
                } else {
                    setError("Error: Failed to fetch applied jobs");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAppliedJobs();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading applied jobs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h2 className="title">All Jobs</h2>
            {jobs.length === 0 ? (
                <p className="no-jobs">No job applications found.</p>
            ) : (
                <div className="job-grid">
                    {jobs.map((job) => (
                        <div key={job._id} className="job-card">
                            <h3 className="job-title">{job.email}</h3>
                            <p className="company">{job.company}</p>
                            <p className="role">{job.role}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllJobs;