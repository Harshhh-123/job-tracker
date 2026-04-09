export const parseJobDescription = async (jd) => {
  // Mock AI parsing - extracts basic info from the JD text
  const lower = jd.toLowerCase();
  
  return {
    company: "",
    role: lower.includes("backend") ? "Backend Developer" 
        : lower.includes("frontend") ? "Frontend Developer"
        : lower.includes("fullstack") || lower.includes("full stack") ? "Full Stack Developer"
        : "Software Developer",
    skills: ["JavaScript", "Node.js", "React", "MongoDB"],
    seniority: lower.includes("senior") ? "senior" 
              : lower.includes("junior") ? "junior" : "mid",
    location: lower.includes("remote") ? "Remote" 
              : lower.includes("bangalore") ? "Bangalore" : "Not specified"
  };
};

export const generateResumeSuggestions = async (role, skills) => {
  return [
    `Developed scalable ${role} solutions improving system performance by 40%`,
    `Collaborated with cross-functional teams to deliver ${skills?.[0] || 'software'} projects on time`,
    `Implemented RESTful APIs and optimized database queries reducing latency by 30%`,
    `Led code reviews and mentored junior developers on best practices`
  ];
};