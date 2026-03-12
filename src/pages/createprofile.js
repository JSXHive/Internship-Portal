import {
  Box,
  Heading,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Select,
  useColorModeValue,
  useToast,
  Wrap,
  RadioGroup,
  Radio,
  Flex,
  Text,
  Icon,
  Card,
  CardBody,
  Divider,
  Grid,
  Avatar,
  Center,
  Container,
  SimpleGrid,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Tooltip,
  Image,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { 
  FaCamera, 
  FaLinkedin, 
  FaGithub, 
  FaFilePdf, 
  FaUniversity, 
  FaGraduationCap,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaStar,
  FaAward,
  FaIdCard,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCode,
  FaLaptopCode,
  FaBook,
  FaGlobe,
  FaIdBadge,
  FaBriefcase,
  FaFileUpload,
  FaRocket,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaExternalLinkAlt,
  FaFileAlt,
  FaImage,
  FaPlus,
  FaSmile,
  FaRocket as FaRocketIcon,
  FaMagic,
  FaThumbsUp,
} from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function CreateProfile() {
  const router = useRouter();
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const primaryColor = "#3182CE";
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [gender, setGender] = useState("");
  const [about, setAbout] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [skills, setSkills] = useState([]);
  const [inputSkill, setInputSkill] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [userId, setUserId] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [customCollege, setCustomCollege] = useState("");
  const [customBranch, setCustomBranch] = useState("");
  
  const sections = [
    "Personal Info",
    "Education",
    "Skills",
    "Profiles",
    "Documents"
  ];
  
  const topSkills = [
    "React", "Node.js", "Python", "Java", "C++", "Artificial Intelligence", "Machine Learning", 
    "UI/UX", "SQL", "JavaScript", "HTML/CSS", "Hardware Design", 
    "Networking", "Data Structures", "Algorithms", "Cloud Computing", 
    "Cybersecurity", "Mobile App Development", "Game Development", 
    "Next JS", "Database Management", "Web Development", "Software Testing"
  ];
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    const fields = [
      email, name, phone, dob, college, branch, cgpa, 
      yearOfStudy, gender, address, linkedin, skills.length > 0,
      resumeFile, profilePhoto
    ];
    
    const completed = fields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (Array.isArray(field)) return field.length > 0;
      return field && field.toString().trim() !== '';
    }).length;

    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();
  
  const showToast = useCallback((title, description, status, icon, duration = 3000) => {
    // Map custom statuses to standard Chakra UI statuses
    const statusMap = {
      success: "success",
      error: "error", 
      warning: "warning",
      info: "info",
      special: "info"
    };

    // Use mapped status or default to "info"
    const chakraStatus = statusMap[status] || "info";
    
    // Custom toast styles based on status
    const statusConfig = {
      success: {
        bg: "linear-gradient(135deg, #38A169 0%, #48BB78 100%)",
        iconColor: "white",
        borderColor: "green.300",
        icon: icon || <FaCheckCircle />,
      },
      error: {
        bg: "linear-gradient(135deg, #E53E3E 0%, #F56565 100%)",
        iconColor: "white",
        borderColor: "red.300",
        icon: icon || <FaExclamationTriangle />,
      },
      warning: {
        bg: "linear-gradient(135deg, #DD6B20 0%, #ED8936 100%)",
        iconColor: "white",
        borderColor: "orange.300",
        icon: icon || <FaInfoCircle />,
      },
      info: {
        bg: "linear-gradient(135deg, #3182CE 0%, #4299E1 100%)",
        iconColor: "white",
        borderColor: "blue.300",
        icon: icon || <FaInfoCircle />,
      },
      special: {
        bg: "linear-gradient(135deg, #805AD5 0%, #9F7AEA 100%)",
        iconColor: "white",
        borderColor: "purple.300",
        icon: icon || <FaMagic />,
      }
    };

    const config = statusConfig[status] || statusConfig.info;

    toast({
      title,
      description,
      status: chakraStatus,
      duration,
      isClosable: true,
      position: "top-right",
      containerStyle: {
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        fontFamily: "'Segoe UI', sans-serif",
        border: "none",
        background: config.bg,
        color: "white",
        maxWidth: "400px",
      },
      icon: React.cloneElement(config.icon, { color: config.iconColor }),
    });
  }, [toast]);
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        showToast("Session Expired", "Please sign up again to continue", "error", <FaExclamationTriangle />);
        router.replace("/signup");
        return;
      }
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.email || !parsedUser.userId) {
        showToast("Invalid Session", "Please sign up again", "error", <FaExclamationTriangle />);
        router.replace("/signup");
        return;
      }
      setEmail(parsedUser.email);
      setName(parsedUser.name || "");
      setUserId(parsedUser.userId);
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
      showToast("Error", "Failed to load user data", "error", <FaExclamationTriangle />);
      router.replace("/signup");
    }
  }, [router, showToast]);

  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault();
      showToast("Complete Your Profile", "Please finish setting up your profile before leaving", "warning", <FaInfoCircle />);
      window.history.pushState(null, null, window.location.href);
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [showToast]);
  
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateFieldWithToast(field);
  };

  const validateFieldWithToast = (field) => {
    let error = "";
    let value = "";
    
    switch (field) {
      case 'phone':
        value = phone.trim();
        if (!value) {
          error = "Phone number is required";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Phone number must be exactly 10 digits";
        }
        break;
      
      case 'dob':
        value = dob;
        if (!value) {
          error = "Date of birth is required";
        } else if (!isAdult(value)) {
          error = "You must be at least 18 years old";
        }
        break;
      
      case 'cgpa':
        value = cgpa.trim();
        if (!value) {
          error = "CGPA is required";
        } else {
          const cgpaValue = parseFloat(value);
          if (isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
            error = "CGPA must be a number between 0 and 10";
          }
        }
        break;
      
      case 'linkedin':
        value = linkedin.trim();
        if (!value) {
          error = "LinkedIn profile is required";
        } else {
          let linkedinUrl = value;
          if (!/^https?:\/\//i.test(linkedinUrl)) {
            linkedinUrl = "https://" + linkedinUrl;
          }
          const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+\/?$/i;
          if (!linkedinPattern.test(linkedinUrl)) {
            error = "Please enter a valid LinkedIn profile URL";
          }
        }
        break;
      
      case 'github':
        value = github.trim();
        if (value && !/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/i.test(value)) {
          error = "Please enter a valid GitHub profile URL";
        }
        break;
      
      case 'address':
        value = address.trim();
        if (!value) {
          error = "Address is required";
        }
        break;
      
      default:
        break;
    }

    if (error) {
      showToast("Validation Error", error, "error", <FaExclamationTriangle />);
      return false;
    }
    return true;
  };

  const isAdult = (dateString) => {
    const today = new Date();
    const dobDate = new Date(dateString);
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    return age >= 18;
  };
  
  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      if (skills.length >= 10) {
        showToast("Maximum Skills Reached", "You can add up to 10 skills only", "warning", <FaInfoCircle />);
        return;
      }
      setSkills((prev) => [...prev, trimmed]);
      setInputSkill("");
      showToast("Skill Added", `${trimmed} has been added to your skills`, "success", <FaCheckCircle />);
    }
  };

  const handleRemoveSkill = (s) => {
    setSkills((prev) => prev.filter((x) => x !== s));
    showToast("Skill Removed", `${s} has been removed from your skills`, "info", <FaInfoCircle />);
  };
  
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showToast("File Too Large", "Profile photo must be less than 5MB", "error", <FaExclamationTriangle />);
      return;
    }
    
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setProfilePhoto(file);
      const previewURL = URL.createObjectURL(file);
      setProfilePreview(previewURL);
      showToast("Photo Uploaded", "Profile photo successfully attached", "success", <FaCamera />);
    } else {
      showToast("Invalid File Type", "Please upload a JPG or PNG image", "error", <FaExclamationTriangle />);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 1 * 1024 * 1024) {
      showToast("File Too Large", "Resume must be less than 1MB", "error", <FaExclamationTriangle />);
      return;
    }
    
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      showToast("Resume Uploaded", "PDF file successfully attached", "success", <FaFilePdf />);
    } else {
      setResumeFile(null);
      showToast("Invalid File Type", "Please upload a PDF file", "error", <FaExclamationTriangle />);
    }
  };
  
  const validateSection = (sectionIndex) => {
    switch (sectionIndex) {
      case 0:
        if (!phone.trim()) {
          showToast("Phone Required", "Please enter your phone number", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!/^\d{10}$/.test(phone.trim())) {
          showToast("Invalid Phone", "Phone number must be exactly 10 digits", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!dob) {
          showToast("Date of Birth Required", "Please enter your date of birth", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!isAdult(dob)) {
          showToast("Age Restriction", "You must be at least 18 years old", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!gender) {
          showToast("Gender Required", "Please select your gender", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!address.trim()) {
          showToast("Address Required", "Please enter your address", "error", <FaExclamationTriangle />);
          return false;
        }
        return true;
        
      case 1:
        if (!college) {
          showToast("College Required", "Please select your college", "error", <FaExclamationTriangle />);
          return false;
        }
        if (college === "Other" && !customCollege.trim()) {
          showToast("College Name Required", "Please enter your college name", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!branch) {
          showToast("Branch Required", "Please select your branch", "error", <FaExclamationTriangle />);
          return false;
        }
        if (branch === "Other" && !customBranch.trim()) {
          showToast("Branch Name Required", "Please enter your branch name", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!cgpa.trim()) {
          showToast("CGPA Required", "Please enter your CGPA", "error", <FaExclamationTriangle />);
          return false;
        }
        const cgpaValue = parseFloat(cgpa);
        if (isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
          showToast("Invalid CGPA", "CGPA must be a number between 0 and 10", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!yearOfStudy) {
          showToast("Year of Study Required", "Please select your year of study", "error", <FaExclamationTriangle />);
          return false;
        }
        return true;
        
      case 2:
        if (skills.length === 0) {
          showToast("Skills Required", "Please add at least one skill", "error", <FaExclamationTriangle />);
          return false;
        }
        return true;
        
      case 3:
        if (!linkedin.trim()) {
          showToast("LinkedIn Required", "Please enter your LinkedIn profile", "error", <FaExclamationTriangle />);
          return false;
        }
        let linkedinUrl = linkedin.trim();
        if (!/^https?:\/\//i.test(linkedinUrl)) {
          linkedinUrl = "https://" + linkedinUrl;
        }
        const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+\/?$/i;
        if (!linkedinPattern.test(linkedinUrl)) {
          showToast("Invalid LinkedIn URL", "Please enter a valid LinkedIn profile URL", "error", <FaExclamationTriangle />);
          return false;
        }
        return true;
        
      case 4:
        if (!profilePhoto) {
          showToast("Profile Photo Required", "Please upload a profile photo", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!resumeFile) {
          showToast("Resume Required", "Please upload your resume", "error", <FaExclamationTriangle />);
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const nextSection = () => {
    if (!validateSection(currentSection)) {
      return;
    }
    
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      showToast(
        `Moving to ${sections[currentSection + 1]}`,
        "Keep up the great work!",
        "info",
        <FaArrowRight />,
        1500
      );
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      showToast(
        `Back to ${sections[currentSection - 1]}`,
        "Take your time to review",
        "info",
        <FaArrowLeft />,
        1500
      );
    }
  };

  const validateFormWithToast = () => {
    const fieldsToValidate = ['phone', 'dob', 'cgpa', 'linkedin', 'github', 'address'];
    let isValid = true;
    
    for (const field of fieldsToValidate) {
      if (!validateFieldWithToast(field)) {
        isValid = false;
      }
    }

    if (!profilePhoto) {
      showToast("Profile Photo Required", "Please upload a profile photo", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    if (!gender.trim()) {
      showToast("Gender Required", "Please select your gender", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    if (!college) {
      showToast("College Required", "Please select your college", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    if (college === "Other" && !customCollege.trim()) {
      showToast("College Name Required", "Please enter your college name", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    if (!branch) {
      showToast("Branch Required", "Please select your branch", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    if (branch === "Other" && !customBranch.trim()) {
      showToast("Branch Name Required", "Please enter your branch name", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    if (!yearOfStudy) {
      showToast("Year of Study Required", "Please select your year of study", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    if (skills.length === 0) {
      showToast("Skills Required", "Please add at least one skill", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    if (!resumeFile) {
      showToast("Resume Required", "Please upload your resume", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!email || !name || !userId) {
      showToast("Session Expired", "Please log in again", "error", <FaExclamationTriangle />);
      router.replace("/signup");
      return;
    }

    setTouched({
      phone: true, dob: true, cgpa: true, linkedin: true, 
      github: true, address: true, gender: true, college: true,
      branch: true, yearOfStudy: true, skills: true
    });

    if (!validateFormWithToast()) {
      return;
    }

    setIsSubmitting(true);

    // Show a special toast for submission start
    showToast(
      "Submitting Profile", 
      "Your profile is being processed...", 
      "info", 
      <FaRocketIcon />,
      2000
    );

    let linkedinUrl = linkedin.trim();
    if (!/^https?:\/\//i.test(linkedinUrl)) {
      linkedinUrl = "https://" + linkedinUrl;
    }

    if (!about.trim()) {
      setAbout("Not specified");
    }
    
    const formatDateForDB = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let formattedDob;
    try {
      if (!dob) {
        throw new Error("Date of birth is required");
      }
      
      formattedDob = formatDateForDB(dob);
    } catch (parseError) {
      console.error("Date formatting error:", parseError);
      showToast("Date Error", parseError.message, "error", <FaExclamationTriangle />);
      setIsSubmitting(false);
      return;
    }

    // Use custom college/branch if "Other" is selected
    const finalCollege = college === "Other" ? customCollege : college;
    const finalBranch = branch === "Other" ? customBranch : branch;

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("email", email.trim());
    formData.append("name", name.trim());
    formData.append("dob", formattedDob);
    formData.append("phone", phone.trim());
    formData.append("college", finalCollege);
    formData.append("branch", finalBranch);
    formData.append("cgpa", cgpa.trim());
    formData.append("year_of_study", yearOfStudy);
    formData.append("gender", gender);
    formData.append("about", about.trim());
    formData.append("skills", skills.join(","));
    formData.append("linkedin_url", linkedinUrl);
    formData.append("address", address.trim());
    if (github.trim()) formData.append("github_url", github.trim());
    if (resumeFile) formData.append("resume", resumeFile);
    if (profilePhoto) formData.append("profile_photo", profilePhoto);

    try {
      const res = await fetch("/api/createprofile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.error || "Failed to save profile");
      }

      showToast(
        "Profile Created Successfully!", 
        "Your profile has been saved successfully! 🎉", 
        "success", 
        <FaThumbsUp />,
        4000
      );
      
      window.removeEventListener('popstate', () => {});
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (e) {
      console.error(e);
      showToast("Error", e.message || "Failed to save profile. Please try again.", "error", <FaExclamationTriangle />);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex 
      direction="column" 
      minH="100vh" 
      fontFamily="'Segoe UI', sans-serif"
      bg="gray.50"
    >      
      <Box flex="1" py={8} fontFamily="'Segoe UI', sans-serif" bg="white">
        <Container maxW="4xl" fontFamily="'Segoe UI', sans-serif">
          {/* Header Section */}
          <MotionBox
            textAlign="center"
            mb={8}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Heading size="xl" color={primaryColor} mb={2} fontFamily="'Segoe UI', sans-serif">
              <Icon as={FaRocket} mr={3} color="blue.500" />
              Complete Your Internship Profile
            </Heading>
            <Text color="gray.600" fontSize="lg" fontFamily="'Segoe UI', sans-serif">
              Fill in your details to apply for internships with Info Tech Corporation of Goa
            </Text>
          </MotionBox>

          {/* Progress Section */}
          <MotionBox
            mb={6}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="sm" fontWeight="bold" color="gray.600">Profile Completion</Text>
              <Text fontSize="sm" fontWeight="bold" color={primaryColor}>{completionPercentage}%</Text>
            </Flex>
            <Progress value={completionPercentage} size="lg" colorScheme="blue" borderRadius="full" />
            {completionPercentage < 100 && (
              <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                Complete all fields to submit your profile
              </Text>
            )}
          </MotionBox>
          
          {/* Section Navigation */}
          <Flex justify="center" mb={6}>
            <HStack spacing={0} border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
              {sections.map((section, index) => (
                <Box 
                  key={index}
                  px={4}
                  py={2}
                  bg={currentSection === index ? "blue.500" : "white"}
                  color={currentSection === index ? "white" : "gray.700"}
                  cursor="pointer"
                  onClick={() => {
                    if (index <= currentSection + 1) {
                      setCurrentSection(index);
                    } else {
                      showToast("Complete Current Section", "Please complete the current section first", "warning", <FaInfoCircle />);
                    }
                  }}
                  borderRight={index < sections.length - 1 ? "1px solid" : "none"}
                  borderColor="gray.200"
                  fontFamily="'Segoe UI', sans-serif"
                  fontWeight="medium"
                  transition="all 0.2s"
                  _hover={{ bg: currentSection === index ? "blue.600" : "gray.50" }}
                  opacity={index > currentSection + 1 ? 0.6 : 1}
                >
                  {section}
                </Box>
              ))}
            </HStack>
          </Flex>
          
          {/* Main Form */}
          <MotionCard 
            bg={cardBg} 
            shadow="xl" 
            rounded="xl" 
            border="1px" 
            borderColor={borderColor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <VStack spacing={6} align="stretch">
                {/* Personal Information Section */}
                <Box display={currentSection === 0 ? "block" : "none"}>
                  <Heading size="md" color={primaryColor} mb={4} display="flex" alignItems="center">
                    <Icon as={FaIdBadge} mr={2} /> Personal Information
                  </Heading>
                  <Divider mb={4} />
                  
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaUser} mr={2} /> Full Name
                      </FormLabel>
                      <Input 
                        value={name} 
                        isReadOnly 
                        bg="gray.100" 
                        fontFamily="'Segoe UI', sans-serif" 
                        autoComplete="off"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaIdCard} mr={2} /> Email Address
                      </FormLabel>
                      <Input 
                        value={email} 
                        isReadOnly 
                        bg="gray.100" 
                        fontFamily="'Segoe UI', sans-serif" 
                        autoComplete="off"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaBirthdayCake} mr={2} /> Date of Birth
                      </FormLabel>
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        onBlur={() => handleBlur('dob')}
                        max={new Date().toISOString().split('T')[0]}
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaVenusMars} mr={2} /> Gender
                      </FormLabel>
                      <RadioGroup value={gender} onChange={setGender}>
                        <HStack spacing={6}>
                          <Radio value="Male" fontFamily="'Segoe UI', sans-serif">Male</Radio>
                          <Radio value="Female" fontFamily="'Segoe UI', sans-serif">Female</Radio>
                          <Radio value="Other" fontFamily="'Segoe UI', sans-serif">Other</Radio>
                        </HStack>
                      </RadioGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaPhone} mr={2} /> Phone Number
                      </FormLabel>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onBlur={() => handleBlur('phone')}
                        placeholder="10-digit number"
                        type="tel"
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaMapMarkerAlt} mr={2} /> Address
                      </FormLabel>
                      <Textarea
                        placeholder="Enter your complete address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onBlur={() => handleBlur('address')}
                        rows={3}
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      />
                    </FormControl>
                  </Grid>
                </Box>

                {/* Educational Information Section */}
                <Box display={currentSection === 1 ? "block" : "none"}>
                  <Heading size="md" color={primaryColor} mb={4} display="flex" alignItems="center">
                    <Icon as={FaGraduationCap} mr={2} /> Educational Information
                  </Heading>
                  <Divider mb={4} />
                  
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaUniversity} mr={2} /> College
                      </FormLabel>
                      <Select
                        placeholder="Select your college"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      >
                        <option>Goa College of Engineering</option>
                        <option>Padre Conceicao College of Engineering</option>
                        <option>Shree Rayeshwar Institute of Engineering & IT</option>
                        <option>Agnel Institute of Technology and Design</option>
                        <option>Don Bosco College Of Engineering</option>
                        <option value="Other">Other (Please specify)</option>
                      </Select>
                      {college === "Other" && (
                        <Input
                          mt={2}
                          placeholder="Enter your college name"
                          value={customCollege}
                          onChange={(e) => setCustomCollege(e.target.value)}
                          fontFamily="'Segoe UI', sans-serif"
                          autoComplete="off"
                        />
                      )}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaBook} mr={2} /> Branch
                      </FormLabel>
                      <Select
                        placeholder="Select branch"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      >
                        <option>Computer</option>
                        <option>Information Technology</option>
                        <option>Electronics And Telecommunication</option>
                        <option>Electronics And Computer</option>
                        <option>Electrical</option>
                        <option>Mechanical</option>
                        <option value="Other">Other (Please specify)</option>
                      </Select>
                      {branch === "Other" && (
                        <Input
                          mt={2}
                          placeholder="Enter your branch name"
                          value={customBranch}
                          onChange={(e) => setCustomBranch(e.target.value)}
                          fontFamily="'Segoe UI', sans-serif"
                          autoComplete="off"
                        />
                      )}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaStar} mr={2} /> CGPA (0-10 scale)
                      </FormLabel>
                      <Input
                        value={cgpa}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 10)) {
                            setCgpa(value);
                          }
                        }}
                        onBlur={() => handleBlur('cgpa')}
                        placeholder="e.g., 8.5"
                        type="text"
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaGlobe} mr={2} /> Year of Study
                      </FormLabel>
                      <Select
                        placeholder="Select year"
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                      </Select>
                    </FormControl>
                  </Grid>
                </Box>

                {/* Skills Section */}
                <Box display={currentSection === 2 ? "block" : "none"}>
                  <Heading size="md" color={primaryColor} mb={4} display="flex" alignItems="center">
                    <Icon as={FaLaptopCode} mr={2} /> Skills & Expertise
                  </Heading>
                  <Divider mb={4} />
                  
                  <FormControl isRequired>
                    <FormLabel display="flex" alignItems="center">
                      <Icon as={FaPlus} mr={2} color="black" /> Add Your Skills (Max: 10)
                    </FormLabel>
                    <HStack>
                      <Input
                        placeholder="e.g., React, Python, UI/UX"
                        value={inputSkill}
                        onChange={(e) => setInputSkill(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddSkill(inputSkill))
                        }
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      />
                      <Button 
                        onClick={() => handleAddSkill(inputSkill)} 
                        colorScheme="blue"
                        isDisabled={!inputSkill.trim()}
                        fontFamily="'Segoe UI', sans-serif"
                      >
                        Add
                      </Button>
                    </HStack>

                    <Text mt={2} fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                      Popular skills:
                    </Text>
                    <Wrap spacing={2} mt={2}>
                      {topSkills.map((skill) => (
                        <Button
                          key={skill}
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddSkill(skill)}
                          isDisabled={skills.includes(skill)}
                          colorScheme={skills.includes(skill) ? "gray" : "blue"}
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          {skill}
                        </Button>
                      ))}
                    </Wrap>

                    <Wrap spacing={2} mt={4}>
                      {skills.map((skill) => (
                        <Tag
                          key={skill}
                          size="md"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="blue"
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          <TagLabel>{skill}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveSkill(skill)} />
                        </Tag>
                      ))}
                    </Wrap>
                    {skills.length > 0 && (
                      <Text mt={2} fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                        {skills.length}/10 skills added
                      </Text>
                    )}
                  </FormControl>
                </Box>

                {/* Professional Profiles */}
                <Box display={currentSection === 3 ? "block" : "none"}>
                  <Heading size="md" color={primaryColor} mb={4} display="flex" alignItems="center">
                    <Icon as={FaBriefcase} mr={2} /> Professional Profiles
                  </Heading>
                  <Divider mb={4} />
                  
                  <FormControl isRequired>
                    <FormLabel display="flex" alignItems="center">
                      <Icon as={FaLinkedin} mr={2} color="#0077B5" /> LinkedIn Profile
                    </FormLabel>
                    <Input
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      onBlur={() => handleBlur('linkedin')}
                      placeholder="https://linkedin.com/in/yourprofile"
                      type="url"
                      fontFamily="'Segoe UI', sans-serif"
                      autoComplete="off"
                    />
                  </FormControl>

                  <FormControl mt={4}>
                    <FormLabel display="flex" alignItems="center">
                      <Icon as={FaGithub} mr={2} /> GitHub Profile (Optional)
                    </FormLabel>
                    <Input
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      onBlur={() => handleBlur('github')}
                      placeholder="https://github.com/yourusername"
                      type="url"
                      fontFamily="'Segoe UI', sans-serif"
                      autoComplete="off"
                    />
                  </FormControl>

                  <FormControl mt={4}>
                    <FormLabel display="flex" alignItems="center">
                      <Icon as={FaCode} mr={2} /> About Your Experience (Optional)
                    </FormLabel>
                    <Textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Describe any previous internships, projects, or relevant experience"
                      rows={4}
                      fontFamily="'Segoe UI', sans-serif"
                      autoComplete="off"
                    />
                  </FormControl>
                </Box>

                {/* File Uploads */}
                <Box display={currentSection === 4 ? "block" : "none"}>
                  <Heading size="md" color={primaryColor} mb={4} display="flex" alignItems="center">
                    <Icon as={FaFileUpload} mr={2} /> Document Uploads
                  </Heading>
                  <Divider mb={4} />
                  
                  {/* Upload Status Summary */}
                  <MotionBox
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    mb={6}
                    p={4}
                    bg="white"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    boxShadow="sm"
                  >
                    <Heading size="sm" mb={3} display="flex" alignItems="center">
                      <Icon as={FaEye} mr={2} color={primaryColor} /> Upload Status
                    </Heading>
                    <SimpleGrid columns={[1, 2]} spacing={3}>
                      <HStack spacing={3}>
                        <Box
                          w={3}
                          h={3}
                          borderRadius="full"
                          bg={profilePreview ? "green.500" : "gray.300"}
                        />
                        <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                          Profile Photo: {profilePreview ? "Uploaded" : "Not uploaded"}
                        </Text>
                        {profilePreview && (
                          <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
                        )}
                      </HStack>
                      <HStack spacing={3}>
                        <Box
                          w={3}
                          h={3}
                          borderRadius="full"
                          bg={resumeFile ? "green.500" : "gray.300"}
                        />
                        <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                          Resume: {resumeFile ? "Uploaded" : "Not uploaded"}
                        </Text>
                        {resumeFile && (
                          <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
                        )}
                      </HStack>
                    </SimpleGrid>
                  </MotionBox>
                  
                  {/* Uploaded Files Preview */}
                  {(profilePreview || resumeFile) && (
                    <MotionBox
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.4 }}
                      mb={6}
                      p={4}
                      bg="blue.50"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="blue.200"
                    >
                      <Heading size="sm" mb={3} display="flex" alignItems="center">
                        <Icon as={FaFileAlt} mr={2} color="blue.500" /> Uploaded Files Preview
                      </Heading>
                      <SimpleGrid columns={[1, 2]} spacing={4}>
                        {profilePreview && (
                          <Box p={3} bg="white" borderRadius="md" boxShadow="sm">
                            <HStack spacing={3} mb={2}>
                              <Icon as={FaImage} color="blue.500" />
                              <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Profile Photo</Text>
                            </HStack>
                            <Image 
                              src={profilePreview} 
                              alt="Uploaded profile" 
                              maxH="120px" 
                              mx="auto"
                              borderRadius="md"
                              objectFit="contain"
                            />
                            <Button 
                              size="xs" 
                              mt={2}
                              variant="outline" 
                              colorScheme="blue"
                              leftIcon={<FaExternalLinkAlt />}
                              onClick={() => window.open(profilePreview, '_blank')}
                              fontFamily="'Segoe UI', sans-serif"
                            >
                              View Full Size
                            </Button>
                          </Box>
                        )}
                        {resumeFile && (
                          <Box p={3} bg="white" borderRadius="md" boxShadow="sm">
                            <HStack spacing={3} mb={2}>
                              <Icon as={FaFilePdf} color="red.500" />
                              <Text fontWeight="medium" fontFamily="'Segoe UI', sans-serif">Resume</Text>
                            </HStack>
                            <VStack spacing={2} align="start">
                              <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                                File: {resumeFile.name}
                              </Text>
                              <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                                Size: {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                              </Text>
                              <Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                                Type: {resumeFile.type}
                              </Text>
                            </VStack>
                            <Button 
                              size="xs" 
                              mt={2}
                              variant="outline" 
                              colorScheme="red"
                              leftIcon={<FaExternalLinkAlt />}
                              onClick={() => {
                                const fileURL = URL.createObjectURL(resumeFile);
                                window.open(fileURL, '_blank');
                              }}
                              fontFamily="'Segoe UI', sans-serif"
                            >
                              View PDF
                            </Button>
                          </Box>
                        )}
                      </SimpleGrid>
                    </MotionBox>
                  )}
                  
                  <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6}>
                    {/* Profile Photo Upload */}
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FormControl isRequired>
                        <FormLabel display="flex" alignItems="center">
                          <Icon as={FaCamera} mr={2} /> Profile Photo
                        </FormLabel>
                        <Box 
                          border="2px dashed" 
                          borderColor={profilePreview ? "green.300" : "gray.300"}
                          borderRadius="lg" 
                          p={4} 
                          textAlign="center"
                          bg={profilePreview ? "green.50" : "gray.50"}
                          _hover={{ 
                            borderColor: profilePreview ? "green.400" : primaryColor, 
                            cursor: "pointer",
                            transform: "translateY(-2px)",
                            boxShadow: "md"
                          }}
                          transition="all 0.3s ease"
                          position="relative"
                          overflow="hidden"
                        >
                          <Input
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={handleProfilePhotoChange}
                            position="absolute"
                            opacity={0}
                            width="100%"
                            height="100%"
                            top={0}
                            left={0}
                            cursor="pointer"
                            autoComplete="off"
                            zIndex={1}
                          />
                          {profilePreview ? (
                            <VStack spacing={3}>
                              <Center position="relative">
                                <Avatar size="xl" src={profilePreview} border="2px solid" borderColor="green.300" />
                                <Box
                                  position="absolute"
                                  top={0}
                                  right={0}
                                  bg="green.500"
                                  borderRadius="full"
                                  p={1}
                                >
                                  <Icon as={FaCheckCircle} color="white" boxSize={3} />
                                </Box>
                              </Center>
                              <Text fontSize="sm" color="green.600" fontWeight="medium" fontFamily="'Segoe UI', sans-serif">
                                Photo Uploaded Successfully!
                              </Text>
                              <Button 
                                size="xs" 
                                variant="outline" 
                                colorScheme="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProfilePreview(null);
                                  setProfilePhoto(null);
                                }}
                                fontFamily="'Segoe UI', sans-serif"
                              >
                                Remove
                              </Button>
                            </VStack>
                          ) : (
                            <VStack spacing={3}>
                              <Center
                                w={16}
                                h={16}
                                borderRadius="full"
                                bg="blue.50"
                                border="2px dashed"
                                borderColor="blue.200"
                              >
                                <Icon as={FaCamera} boxSize={6} color="blue.400" />
                              </Center>
                              <VStack spacing={1}>
                                <Text fontSize="sm" color="gray.600" fontFamily="'Segoe UI', sans-serif">
                                  <Box as="span" color="blue.500" fontWeight="medium">Click to upload</Box> or drag and drop
                                </Text>
                                <Text fontSize="xs" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                                  JPG Or PNG (Max 1 MB)
                                </Text>
                              </VStack>
                            </VStack>
                          )}
                        </Box>
                      </FormControl>
                    </MotionBox>

                    {/* Resume Upload */}
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <FormControl isRequired>
                        <FormLabel display="flex" alignItems="center">
                          <Icon as={FaFilePdf} mr={2} color="red.500" /> Resume (PDF)
                        </FormLabel>
                        <Box 
                          border="2px dashed" 
                          borderColor={resumeFile ? "green.300" : "gray.300"}
                          borderRadius="lg" 
                          p={4} 
                          textAlign="center"
                          bg={resumeFile ? "green.50" : "gray.50"}
                          _hover={{ 
                            borderColor: resumeFile ? "green.400" : primaryColor, 
                            cursor: "pointer",
                            transform: "translateY(-2px)",
                            boxShadow: "md"
                          }}
                          transition="all 0.3s ease"
                          position="relative"
                          overflow="hidden"
                        >
                          <Input
                            type="file"
                            accept="application/pdf"
                            onChange={handleResumeChange}
                            position="absolute"
                            opacity={0}
                            width="100%"
                            height="100%"
                            top={0}
                            left={0}
                            cursor="pointer"
                            autoComplete="off"
                            zIndex={1}
                          />
                          {resumeFile ? (
                            <VStack spacing={3}>
                              <Center
                                w={16}
                                h={16}
                                borderRadius="full"
                                bg="green.100"
                                border="2px solid"
                                borderColor="green.300"
                              >
                                <Icon as={FaFilePdf} boxSize={6} color="green.600" />
                              </Center>
                              <VStack spacing={1}>
                                <Text fontSize="sm" color="green.600" fontWeight="medium" fontFamily="'Segoe UI', sans-serif">
                                  Resume Uploaded Successfully!
                                </Text>
                                <Text fontSize="xs" color="gray.600" maxW="full" noOfLines={1} fontFamily="'Segoe UI', sans-serif">
                                  {resumeFile.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                                  {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                </Text>
                              </VStack>
                              <Button 
                                size="xs" 
                                variant="outline" 
                                colorScheme="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setResumeFile(null);
                                }}
                                fontFamily="'Segoe UI', sans-serif"
                                mt={2}
                              >
                                Remove
                              </Button>
                            </VStack>
                          ) : (
                            <VStack spacing={3}>
                              <Center
                                w={16}
                                h={16}
                                borderRadius="full"
                                bg="red.50"
                                border="2px dashed"
                                borderColor="red.200"
                              >
                                <Icon as={FaFilePdf} boxSize={6} color="red.400" />
                              </Center>
                              <VStack spacing={1}>
                                <Text fontSize="sm" color="gray.600" fontFamily="'Segoe UI', sans-serif">
                                  <Box as="span" color="red.500" fontWeight="medium">Click to upload</Box> or drag and drop
                                </Text>
                                <Text fontSize="xs" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                                  PDF Only (max 1 MB)
                                </Text>
                              </VStack>
                            </VStack>
                          )}
                        </Box>
                      </FormControl>
                    </MotionBox>
                  </Grid>

                  {/* Upload Status */}
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    mt={6}
                    p={4}
                    bg="blue.50"
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderColor="blue.400"
                  >
                    <HStack spacing={3}>
                      <Icon as={FaInfoCircle} color="blue.500" />
                      <Text fontSize="sm" color="blue.700" fontFamily="'Segoe UI', sans-serif">
                        Ensure your documents are clear and professional. These will be reviewed by our team.
                      </Text>
                    </HStack>
                  </MotionBox>
                </Box>

                {/* Navigation Buttons */}
                <Flex justify="space-between" mt={8}>
                  <Button
                    onClick={prevSection}
                    isDisabled={currentSection === 0}
                    leftIcon={<FaArrowLeft />}
                    variant="outline"
                    colorScheme="blue"
                    fontFamily="'Segoe UI', sans-serif"
                  >
                    Previous
                  </Button>

                  {currentSection < sections.length - 1 ? (
                    <Button
                      onClick={nextSection}
                      rightIcon={<FaArrowRight />}
                      colorScheme="blue"
                      fontFamily="'Segoe UI', sans-serif"
                      data-testid="next-section-button"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      colorScheme="green"
                      isLoading={isSubmitting}
                      loadingText="Submitting..."
                      size="lg"
                      px={8}
                      fontFamily="'Segoe UI', sans-serif"
                      data-testid="submit-profile-button"
                    >
                      Submit Profile
                    </Button>
                  )}
                </Flex>
              </VStack>
            </CardBody>
          </MotionCard>
        </Container>
      </Box>
    </Flex>
  );
}