import {
  Box,
  Heading,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  useToast,
  Wrap,
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
  Progress,
  Tooltip,
  Image,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { 
  FaCamera, 
  FaPhone,
  FaStar,
  FaAward,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaFileUpload,
  FaRocket,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaExternalLinkAlt,
  FaFileAlt,
  FaImage,
  FaUserTie,
  FaEnvelope,
  FaPlus,
  FaLaptopCode,
  FaThumbsUp,
  FaMagic,
  FaRocket as FaRocketIcon,
} from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function MentorProfileCreation() {
  const router = useRouter();
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const primaryColor = "#3182CE";
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contact_no, setContactNo] = useState("");
  const [designation, setDesignation] = useState("");
  const [area_of_expertise, setAreaOfExpertise] = useState([]);
  const [inputExpertise, setInputExpertise] = useState("");
  const [years_of_experience, setYearsOfExperience] = useState("");
  const [profile_photo, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [userId, setUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  
  const sections = [
    "Personal Info",
    "Professional Details",
    "Documents"
  ];
  
  const topExpertiseAreas = [
    "Software Development", "Web Development", "Mobile App Development", 
    "UI/UX Design", "Data Science", "Machine Learning", "Artificial Intelligence",
    "Cloud Computing", "Cybersecurity", "Networking", "Database Management",
    "DevOps", "Project Management", "Quality Assurance", "Technical Writing",
    "Digital Marketing", "Business Analysis", "Product Management"
  ];
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    const fields = [
      email, name, contact_no, designation, 
      area_of_expertise.length > 0, years_of_experience, profile_photo
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
    // Map custom status to valid Chakra UI status
    const validStatus = status === "special" ? "info" : status;
    
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
        bg: status === "special" 
          ? "linear-gradient(135deg, #805AD5 0%, #9F7AEA 100%)" 
          : "linear-gradient(135deg, #3182CE 0%, #4299E1 100%)",
        iconColor: "white",
        borderColor: status === "special" ? "purple.300" : "blue.300",
        icon: icon || <FaInfoCircle />,
      },
    };

    const config = statusConfig[validStatus] || statusConfig.info;

    toast({
      title,
      description,
      status: validStatus,
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
      showToast("Complete Your Mentor Profile", "Please finish setting up your profile before leaving", "warning", <FaInfoCircle />);
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
      case 'contact_no':
        value = contact_no.trim();
        if (!value) {
          error = "Contact number is required";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Contact number must be exactly 10 digits";
        }
        break;
      
      case 'years_of_experience':
        value = years_of_experience.trim();
        if (!value) {
          error = "Years of experience is required";
        } else {
          const expValue = parseFloat(value);
          if (isNaN(expValue) || expValue < 0 || expValue > 50) {
            error = "Years of experience must be a number between 0 and 50";
          }
        }
        break;
      
      case 'designation':
        value = designation.trim();
        if (!value) {
          error = "Designation is required";
        } else if (value.length < 2) {
          error = "Designation must be at least 2 characters";
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
  
  const handleAddExpertise = (expertise) => {
    const trimmed = expertise.trim();
    if (trimmed && !area_of_expertise.includes(trimmed)) {
      if (area_of_expertise.length >= 5) {
        showToast("Maximum Expertise Areas", "You can add up to 5 expertise areas only", "warning", <FaInfoCircle />);
        return;
      }
      setAreaOfExpertise((prev) => [...prev, trimmed]);
      setInputExpertise("");
      showToast("Expertise Added", `${trimmed} has been added to your expertise areas! 🎯`, "success", <FaCheckCircle />);
    }
  };

  const handleRemoveExpertise = (expertise) => {
    setAreaOfExpertise((prev) => prev.filter((x) => x !== expertise));
    showToast("Expertise Removed", `${expertise} has been removed from your expertise areas`, "info", <FaInfoCircle />);
  };
  
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 1 * 1024 * 1024) {
      showToast("File Too Large", "Profile photo must be less than 1MB", "error", <FaExclamationTriangle />);
      return;
    }
    
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setProfilePhoto(file);
      const previewURL = URL.createObjectURL(file);
      setProfilePreview(previewURL);
      showToast("Photo Uploaded", "Profile photo successfully attached! Looking professional! 👔", "success", <FaCamera />);
    } else {
      showToast("Invalid File Type", "Please upload a JPG or PNG image", "error", <FaExclamationTriangle />);
    }
  };
  
  // Validate each section before proceeding
  const validateSection = (sectionIndex) => {
    switch (sectionIndex) {
      case 0: // Personal Info
        if (!contact_no.trim()) {
          showToast("Contact Required", "Please enter your contact number", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!/^\d{10}$/.test(contact_no.trim())) {
          showToast("Invalid Contact", "Contact number must be exactly 10 digits", "error", <FaExclamationTriangle />);
          return false;
        }
        return true;
        
      case 1: // Professional Details
        if (!designation.trim()) {
          showToast("Designation Required", "Please enter your designation", "error", <FaExclamationTriangle />);
          return false;
        }
        if (area_of_expertise.length === 0) {
          showToast("Expertise Required", "Please add at least one area of expertise", "error", <FaExclamationTriangle />);
          return false;
        }
        if (!years_of_experience.trim()) {
          showToast("Experience Required", "Please enter years of experience", "error", <FaExclamationTriangle />);
          return false;
        }
        const expValue = parseFloat(years_of_experience);
        if (isNaN(expValue) || expValue < 0 || expValue > 50) {
          showToast("Invalid Experience", "Years of experience must be between 0 and 50", "error", <FaExclamationTriangle />);
          return false;
        }
        return true;
        
      case 2: // Documents
        if (!profile_photo) {
          showToast("Profile Photo Required", "Please upload a profile photo", "error", <FaExclamationTriangle />);
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
        "Your expertise is shaping up nicely!",
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
        "Take your time to review your details",
        "info",
        <FaArrowLeft />,
        1500
      );
    }
  };

  const validateFormWithToast = () => {
    const fieldsToValidate = ['contact_no', 'years_of_experience', 'designation'];
    let isValid = true;
    
    for (const field of fieldsToValidate) {
      if (!validateFieldWithToast(field)) {
        isValid = false;
      }
    }

    if (area_of_expertise.length === 0) {
      showToast("Expertise Required", "Please add at least one area of expertise", "error", <FaExclamationTriangle />);
      isValid = false;
    }

    if (!profile_photo) {
      showToast("Profile Photo Required", "Please upload a profile photo", "error", <FaExclamationTriangle />);
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

    // Mark all fields as touched
    setTouched({
      contact_no: true, years_of_experience: true, 
      designation: true
    });

    if (!validateFormWithToast()) {
      return;
    }

    setIsSubmitting(true);

    // Show a special toast for submission start
    showToast(
      "Submitting Profile", 
      "Your mentor profile is being processed...", 
      "special", 
      <FaRocketIcon />,
      2000
    );

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("email", email.trim());
    formData.append("name", name.trim());
    formData.append("contact_no", contact_no.trim());
    formData.append("designation", designation.trim());
    formData.append("area_of_expertise", area_of_expertise.join(","));
    formData.append("years_of_experience", years_of_experience.trim());
    if (profile_photo) formData.append("profile_photo", profile_photo);

    try {
      const res = await fetch("/api/mentor/createprofile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.error || "Failed to save profile");
      }

      showToast(
        "Profile Created Successfully!", 
        "Your mentor profile has been saved successfully! 🎉", 
        "success", 
        <FaThumbsUp />,
        4000
      );
      
      // Clear event listeners
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
      bgImage="url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
      bgSize="cover"
      bgPosition="center"
      bgAttachment="fixed"
    >      
      <Box flex="1" py={8} fontFamily="'Segoe UI', sans-serif" bg="rgba(255, 255, 255, 0.92)">
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
              Complete Your Mentor Profile
            </Heading>
            <Text color="gray.600" fontSize="lg" fontFamily="'Segoe UI', sans-serif">
              Fill in your details to become a mentor with Info Tech Corporation of Goa
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
                    // Only allow clicking on completed sections or the next logical section
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
                    <Icon as={FaUserTie} mr={2} /> Personal Information
                  </Heading>
                  <Divider mb={4} />
                  
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaUserTie} mr={2} /> Full Name
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
                        <Icon as={FaEnvelope} mr={2} /> Email Address
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
                        <Icon as={FaPhone} mr={2} /> Contact Number
                      </FormLabel>
                      <Input
                        value={contact_no}
                        onChange={(e) => setContactNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onBlur={() => handleBlur('contact_no')}
                        placeholder="10-digit number"
                        type="tel"
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      />
                    </FormControl>
                  </Grid>
                </Box>

                {/* Professional Details Section */}
                <Box display={currentSection === 1 ? "block" : "none"}>
                  <Heading size="md" color={primaryColor} mb={4} display="flex" alignItems="center">
                    <Icon as={FaAward} mr={2} /> Professional Details
                  </Heading>
                  <Divider mb={4} />
                  
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaUserTie} mr={2} /> Designation
                      </FormLabel>
                      <Input
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        onBlur={() => handleBlur('designation')}
                        placeholder="Your current designation"
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center">
                        <Icon as={FaStar} mr={2} /> Years of Experience
                      </FormLabel>
                      <Input
                        value={years_of_experience}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 50)) {
                            setYearsOfExperience(value);
                          }
                        }}
                        onBlur={() => handleBlur('years_of_experience')}
                        placeholder="e.g., 5.5"
                        type="text"
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      />
                    </FormControl>
                  </Grid>

                  {/* Area of Expertise Section (like skills in student profile) */}
                  <FormControl isRequired mt={4}>
                    <FormLabel display="flex" alignItems="center">
                      <Icon as={FaLaptopCode} mr={2} /> Area of Expertise (Max: 5)
                    </FormLabel>
                    <HStack>
                      <Input
                        placeholder="e.g., React, Python, UI/UX"
                        value={inputExpertise}
                        onChange={(e) => setInputExpertise(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddExpertise(inputExpertise))
                        }
                        fontFamily="'Segoe UI', sans-serif"
                        autoComplete="off"
                      />
                      <Button 
                        onClick={() => handleAddExpertise(inputExpertise)} 
                        colorScheme="blue"
                        isDisabled={!inputExpertise.trim()}
                        fontFamily="'Segoe UI', sans-serif"
                      >
                        Add
                      </Button>
                    </HStack>

                    <Text mt={2} fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                      Popular expertise areas:
                    </Text>
                    <Wrap spacing={2} mt={2}>
                      {topExpertiseAreas.map((expertise) => (
                        <Button
                          key={expertise}
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddExpertise(expertise)}
                          isDisabled={area_of_expertise.includes(expertise)}
                          colorScheme={area_of_expertise.includes(expertise) ? "gray" : "blue"}
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          {expertise}
                        </Button>
                      ))}
                    </Wrap>

                    <Wrap spacing={2} mt={4}>
                      {area_of_expertise.map((expertise) => (
                        <Tag
                          key={expertise}
                          size="md"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="blue"
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          <TagLabel>{expertise}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveExpertise(expertise)} />
                        </Tag>
                      ))}
                    </Wrap>
                    {area_of_expertise.length > 0 && (
                      <Text mt={2} fontSize="sm" color="gray.500" fontFamily="'Segoe UI', sans-serif">
                        {area_of_expertise.length}/5 expertise areas added
                      </Text>
                    )}
                  </FormControl>
                </Box>

                {/* Documents Section */}
                <Box display={currentSection === 2 ? "block" : "none"}>
                  <Heading size="md" color={primaryColor} mb={4} display="flex" alignItems="center">
                    <Icon as={FaFileUpload} mr={2} /> Documents
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
                    </SimpleGrid>
                  </MotionBox>
                  
                  {/* Uploaded Files Preview */}
                  {profilePreview && (
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
                      <SimpleGrid columns={[1, 1]} spacing={4}>
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
                      </SimpleGrid>
                    </MotionBox>
                  )}
                  
                  <Grid templateColumns={["1fr", "1fr"]} gap={6}>
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
                        Ensure your profile photo is professional and clear. This will be visible to students.
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