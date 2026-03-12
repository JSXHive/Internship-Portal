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
  Stack,
  Image,
  Select,
  useColorModeValue,
  useToast,
  Wrap,
  RadioGroup,
  Radio,
  Text,
  Card,
  CardBody,
  Icon,
  Flex,
  Avatar,
  Badge,
  Divider,
  useBreakpointValue,
  Grid,
  GridItem,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useDisclosure,
  Container,
  Center,
  Spinner,
  keyframes,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FaUser,
  FaEnvelope,
  FaBirthdayCake,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaStar,
  FaLinkedin,
  FaGithub,
  FaFilePdf,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaAward,
  FaLightbulb,
  FaBriefcase,
  FaEye,
  FaGlobe,
  FaUniversity,
  FaBook,
  FaCalendarAlt,
  FaVenusMars,
  FaRocket,
  FaArrowLeft,
  FaUserEdit,
  FaIdCard,
  FaCog,
  FaShieldAlt,
  FaPalette,
  FaChartLine,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

// Keyframes for animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

export default function ProfilePage() {
  const toast = useToast();
  const router = useRouter();
  const cardBg = useColorModeValue("white", "gray.800");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const profileCompletionColor = useColorModeValue("blue.50", "blue.900");
  const headerBg = useColorModeValue("blue.600", "blue.800");
  const successBg = useColorModeValue("green.50", "green.900");
  const successColor = useColorModeValue("green.500", "green.300");
  const successTextColor = useColorModeValue("green.800", "green.100");
  const errorBg = useColorModeValue("red.50", "red.900");
  const errorColor = useColorModeValue("red.500", "red.300");
  const errorTextColor = useColorModeValue("red.800", "red.100");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const gradientBg = useColorModeValue(
    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
  );
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    college: "",
    branch: "",
    cgpa: "",
    yearOfStudy: "",
    about: "",
    skills: [],
    linkedin: "",
    github: "",
    profilePhoto: "",
    resume: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [inputSkill, setInputSkill] = useState("");
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoFileName, setProfilePhotoFileName] = useState(""); // Added for filename display
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [showCustomCollege, setShowCustomCollege] = useState(false);
  const [showCustomBranch, setShowCustomBranch] = useState(false);

  const topSkills = [
    "React",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "Machine Learning",
    "UI/UX",
    "SQL",
    "JavaScript",
    "HTML/CSS",
    "Hardware Design",
    "Networking",
    "Data Structures",
    "Algorithms",
    "Cloud Computing",
    "Cybersecurity",
    "Mobile App Development",
    "Game Development",
    "Next JS",
    "Database Management",
    "Web Development",
    "Software Testing",
  ];

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profileData) => {
    if (!profileData) return 0;
    
    const fields = [
      'name', 'dateOfBirth', 'gender', 'phone', 'address', 
      'college', 'branch', 'cgpa', 'yearOfStudy', 'skills',
      'profilePhoto', 'resume'
    ];
    
    let completed = 0;
    fields.forEach(field => {
      if (field === 'skills') {
        if (profileData[field] && profileData[field].length > 0) completed++;
      } else if (profileData[field]) {
        completed++;
      }
    });
    
    return Math.round((completed / fields.length) * 100);
  };

// Function to format date for input field (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    // For DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const parts = dateString.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    // If it's a Date object or other format, extract just the date part
    // without timezone conversion
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Get the date components without timezone adjustment
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

// Function to format date as DD/MM/YYYY for view mode
const formatDateForView = (dateString) => {
  if (!dateString) return "-";
  
  // If it's already in DD/MM/YYYY format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    // For YYYY-MM-DD format (HTML input format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const parts = dateString.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    // For other formats, extract just the date part
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};
  // Function to extract filename from path
  const getFileNameFromPath = (path) => {
    if (!path) return "";
    return path.split('/').pop();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          toast({
            title: "You are not logged in",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          router.push("/login");
          return;
        }

        const user = JSON.parse(storedUser);
        if (!user?.email) {
          toast({
            title: "Invalid session. Please log in again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          router.push("/login");
          return;
        }

        const email = user.email;
        setUserEmail(email);

        const res = await fetch(`/api/getprofile?email=${email}`);
        const data = await res.json();

        // Convert skills string to array if needed
        if (data.skills && typeof data.skills === 'string') {
          data.skills = data.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
        }
        
        // Update profile photo path to use public/profile_photo directory
        if (data.profilePhoto) {
          data.profilePhoto = `/student_interns/profile_photo/${getFileNameFromPath(data.profilePhoto)}`;
          setProfilePhotoFileName(getFileNameFromPath(data.profilePhoto)); // Set filename for display
        }
        
        // Update resume path to use public/resume directory
        if (data.resume) {
          data.resume = `/student_interns/resume/${getFileNameFromPath(data.resume)}`;
          setResumeFileName(getFileNameFromPath(data.resume));
        }
        
        setProfile(data);
        if (data.profilePhoto) {
          setProfilePreview(data.profilePhoto);
        }
        
        // Check if branch is a custom value (not in the predefined list)
        const predefinedBranches = [
          "Computer", "Information Technology", "Electronics And Telecommunication",
          "Electronics And Computer Science", "Computer Science and AIML", "Electrical",
          "Mechanical", "Other"
        ];
        
        if (data.branch && !predefinedBranches.includes(data.branch)) {
          setShowCustomBranch(true);
        }
        
        // Calculate profile completion
        setProfileCompletion(calculateProfileCompletion(data));
      } catch (e) {
        console.error("Failed to fetch profile", e);
        toast({
          title: "Error loading profile",
          description: e.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, toast]);

  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      const updatedProfile = {
        ...profile,
        skills: [...(profile.skills || []), trimmed]
      };
      setProfile(updatedProfile);
      setProfileCompletion(calculateProfileCompletion(updatedProfile));
      setInputSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    const updatedProfile = {
      ...profile,
      skills: profile.skills.filter(s => s !== skill)
    };
    setProfile(updatedProfile);
    setProfileCompletion(calculateProfileCompletion(updatedProfile));
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 5MB to prevent memory issues)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setProfilePhotoFileName(""); // Clear filename if invalid
      return;
    }
    
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setProfilePhotoFile(file);
      setProfilePhotoFileName(file.name); // Set filename for display
      const previewURL = URL.createObjectURL(file);
      setProfilePreview(previewURL);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setProfilePhotoFileName(""); // Clear filename if invalid
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 10MB to prevent memory issues)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a PDF smaller than 10MB.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setResumeFile(null);
      setResumeFileName("");
      return;
    }
    
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      setResumeFileName(file.name);
    } else {
      setResumeFile(null);
      setResumeFileName("");
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    if (value === "Other") {
      setShowCustomCollege(true);
      setProfile({ ...profile, college: "" });
    } else {
      setShowCustomCollege(false);
      setProfile({ ...profile, college: value });
    }
  };

  const handleBranchChange = (e) => {
    const value = e.target.value;
    if (value === "Other") {
      setShowCustomBranch(true);
      setProfile({ ...profile, branch: "" });
    } else {
      setShowCustomBranch(false);
      setProfile({ ...profile, branch: value });
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("email", userEmail);
      formData.append("name", profile.name || "");
      formData.append("dateOfBirth", profile.dateOfBirth || "");
      formData.append("gender", profile.gender || "");
      formData.append("phone", profile.phone || "");
      formData.append("address", profile.address || "");
      formData.append("college", profile.college || "");
      formData.append("branch", profile.branch || "");
      formData.append("cgpa", profile.cgpa || "");
      formData.append("yearOfStudy", profile.yearOfStudy || "");
      formData.append("about", profile.about || "");
      formData.append("skills", Array.isArray(profile.skills) ? profile.skills.join(",") : "");
      formData.append("linkedin", profile.linkedin || "");
      formData.append("github", profile.github || "");
      
      // Add directory paths for file uploads
      formData.append("profilePhotoDir", "profile_photo");
      formData.append("resumeDir", "resume");
      
      if (profilePhotoFile) {
        formData.append("profilePhoto", profilePhotoFile);
      }
      
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const res = await fetch("/api/updateprofile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const result = await res.json();
      
      toast({
        title:"Profile Updated Successfully!!",
        description:"Your profile information has been saved and updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
        containerStyle: {
          marginTop: "70px",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "20px",
          backgroundColor: successBg,
          border: `1px solid ${successColor}`,
          color: successTextColor,
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      });

      // Update the profile with the new file paths
      if (result.profilePhotoPath) {
        const updatedProfilePhoto = `/profile_photo/${getFileNameFromPath(result.profilePhotoPath)}`;
        setProfile({...profile, profilePhoto: updatedProfilePhoto});
        setProfilePreview(updatedProfilePhoto);
        setProfilePhotoFileName(getFileNameFromPath(result.profilePhotoPath));
      }
      
      if (result.resumePath) {
        const updatedResume = `/resume/${getFileNameFromPath(result.resumePath)}`;
        setProfile({...profile, resume: updatedResume});
        setResumeFileName(getFileNameFromPath(updatedResume));
      }
      
      setIsEditing(false);
      window.location.reload();
    } catch (e) {
      toast({
        title: "Error",
        description: e.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Loading state
if (loading) {
  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={6}>
        <Box 
          p={6} 
          borderRadius="xl" 
          bgGradient="linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)" // Changed to purple gradient
          color="white"
          boxShadow="xl"
          animation={`${pulse} 2s infinite`}
        >
          <Icon as={FaUser} boxSize={10} />
        </Box>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="pink.500" />
        <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">Loading your profile information...</Text>
        <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
      </VStack>
    </Box>
  );
}

  return (
    <Box minH="100vh" bg="gray.50" fontFamily="'Segoe UI', sans-serif">
      {/* Redesigned Header with Blue/Purple Gradient */}
      <Box 
        bgGradient="linear(to-r, blue.600, purple.600)"
        color="white" 
        py={6}
        position="relative"
        overflow="hidden"
        boxShadow="lg"
      >
        {/* Decorative elements */}
        <Box
          position="absolute"
          top="-50px"
          right="-50px"
          width="200px"
          height="200px"
          borderRadius="full"
          bg="rgba(255,255,255,0.1)"
        />
        <Box
          position="absolute"
          bottom="-30px"
          left="-30px"
          width="150px"
          height="150px"
          borderRadius="full"
          bg="rgba(255,255,255,0.05)"
        />
        
        <Container maxW="6xl" position="relative" zIndex={1}>
          <Flex justify="space-between" align="center">
            <MotionButton
              bg="rgba(255,255,255,0.2)"
              color="white"
              border="1px solid"
              borderColor="rgba(255,255,255,0.3)"
              variant="outline"
              onClick={() => router.push("/student/dashboard")}
              whileHover={{ scale: 1.02, bg: "rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.98 }}
              leftIcon={<FaArrowLeft />}
              size="md"
              backdropFilter="blur(10px)"
              _hover={{ bg: "rgba(255,255,255,0.3)" }}
              fontFamily="'Segoe UI', sans-serif"
            >
              Back to Dashboard
            </MotionButton>
            
            <MotionBox
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              textAlign="center"
            >
              <Heading size="xl" fontWeight="800" letterSpacing="tight" textShadow="0 2px 4px rgba(0,0,0,0.2)" fontFamily="'Segoe UI', sans-serif">
                My Digital Profile
              </Heading>
              <Text fontSize="lg" opacity={0.9} mt={2} fontWeight="300" fontFamily="'Segoe UI', sans-serif">
                Showcase your skills and experience
              </Text>
            </MotionBox>
            
            {/* Profile completion badge */}
            <Box 
              bg="rgba(255,255,255,0.2)" 
              px={4} 
              py={2} 
              borderRadius="full"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255,255,255,0.2)"
            >
              <HStack>
                <Box 
                  w="10px" 
                  h="10px" 
                  borderRadius="full" 
                  bg={profileCompletion === 100 ? "green.300" : "orange.300"}
                  animation={`${pulse} 2s infinite`}
                />
                <Text fontSize="sm" fontWeight="medium" fontFamily="'Segoe UI', sans-serif">
                  {profileCompletion}% Complete
                </Text>
              </HStack>
            </Box>
          </Flex>
        </Container>
        
        {/* Bottom accent line */}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="3px"
          bgGradient="linear(to-r, blue.400, purple.400)"
        />
      </Box>
      
      <Container maxW="6xl" py={8}>
        {/* Profile Completion Card */}
        <MotionCard
          bg={profileCompletionColor}
          borderLeft="4px"
          borderColor="blue.500"
          mb={8}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          boxShadow="md"
          overflow="hidden"
          fontFamily="'Segoe UI', sans-serif"
        >
          <CardBody p={6}>
            <Flex direction={{ base: "column", md: "row" }} alignItems="center" justifyContent="space-between">
              <HStack spacing={4} mb={{ base: 4, md: 0 }}>
                <Center w="60px" h="60px" borderRadius="full" bg="blue.100" boxShadow="inner">
                  <Icon as={FaRocket} boxSize={6} color="blue.600" />
                </Center>
                <Box>
                  <Text fontWeight="bold" color="blue.800" mb={1} fontFamily="'Segoe UI', sans-serif">
                    Profile Completion: {profileCompletion}%
                  </Text>
                  <Progress
                    value={profileCompletion}
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    w="300px"
                    hasStripe={profileCompletion < 100}
                    isAnimated={profileCompletion < 100}
                  />
                  <Text fontSize="sm" color="blue.700" mt={2} fontFamily="'Segoe UI', sans-serif">
                    Complete your profile to increase your chances of getting selected for internships
                  </Text>
                </Box>
              </HStack>
              
              {!isEditing && (
                <MotionButton
                  colorScheme="blue"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<FaEdit />}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  size="lg"
                  boxShadow="md"
                  fontFamily="'Segoe UI', sans-serif"
                >
                  Edit Profile
                </MotionButton>
              )}
            </Flex>
          </CardBody>
        </MotionCard>

        <Grid templateColumns={{ base: "1fr", lg: "3fr 1fr" }} gap={8}>
          <GridItem>
            <MotionCard
              bg={cardBg}
              rounded="xl"
              shadow="xl"
              border="1px"
              borderColor={borderColor}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              overflow="hidden"
              fontFamily="'Segoe UI', sans-serif"
            >
              <CardBody p={8}>
                <VStack spacing={8} align="stretch">
                  {/* Personal Information Section */}
                  <Box>
                    <Heading as="h3" size="lg" color="blue.800" mb={4} display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                      <Center w="10" h="10" borderRadius="md" bg="blue.100" mr={3} boxShadow="inner">
                        <Icon as={FaUser} color="blue.600" />
                      </Center>
                      Personal Information
                    </Heading>
                    <Divider mb={6} />
                    
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
                      {/* Profile Photo */}
                      <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaUser} mr={2} /> Profile Photo
                        </FormLabel>
                        <HStack spacing={4}>
                          {isEditing ? (
                            <>
                              <Box>
                                <Input
                                  type="file"
                                  accept="image/jpeg, image/png"
                                  onChange={handleProfilePhotoChange}
                                  py={1}
                                  fontSize="sm"
                                  fontFamily="'Segoe UI', sans-serif"
                                />
                                {profilePhotoFileName && (
                                  <Text mt={2} fontSize="sm" color="gray.600" fontFamily="'Segoe UI', sans-serif">
                                    Selected file: {profilePhotoFileName}
                                  </Text>
                                )}
                                {profilePreview && (
                                  <Image
                                    src={profilePreview}
                                    alt="Profile Preview"
                                    boxSize="120px"
                                    borderRadius="full"
                                    mt={3}
                                    objectFit="cover"
                                    border="3px solid"
                                    borderColor="blue.100"
                                    boxShadow="md"
                                  />
                                )}
                              </Box>
                            </>
                          ) : (
                            <>
                              <Avatar
                                src={profile.profilePhoto || "/default.png"}
                                alt="Profile"
                                size="xl"
                                border="3px solid"
                                borderColor="blue.100"
                                cursor="pointer"
                                onClick={onOpen}
                                _hover={{ borderColor: "blue.300" }}
                                transition="all 0.3s"
                                boxShadow="md"
                              />
                              {profile.profilePhoto && (
                                <Button 
                                  leftIcon={<FaEye />} 
                                  colorScheme="blue" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={onOpen}
                                  fontFamily="'Segoe UI', sans-serif"
                                >
                                  View Full Size
                                </Button>
                              )}
                            </>
                          )}
                        </HStack>
                      </FormControl>

                      {/* Name */}
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaUser} mr={2} /> Full Name
                        </FormLabel>
                        {isEditing ? (
                          <Input
                            value={profile.name || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                            placeholder="Your full name"
                            size="lg"
                            borderRadius="md"
                            focusBorderColor={accentColor}
                            boxShadow="sm"
                            fontFamily="'Segoe UI', sans-serif"
                          />
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">{profile.name || "-"}</Text>
                        )}
                      </FormControl>

                      {/* Email */}
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaEnvelope} mr={2} /> Email Address
                        </FormLabel>
                        <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" color="gray.600" fontFamily="'Segoe UI', sans-serif">{profile.email || "-"}</Text>
                      </FormControl>

                      {/* DOB */}
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaCalendarAlt} mr={2} /> Date of Birth
                        </FormLabel>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={formatDateForInput(profile.dateOfBirth) || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, dateOfBirth: e.target.value })
                            }
                            size="lg"
                            borderRadius="md"
                            focusBorderColor={accentColor}
                            boxShadow="sm"
                            fontFamily="'Segoe UI', sans-serif"
                          />
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">{formatDateForView(profile.dateOfBirth)}</Text>
                        )}
                      </FormControl>

                      {/* Gender */}
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaVenusMars} mr={2} /> Gender
                        </FormLabel>
                        {isEditing ? (
                          <RadioGroup
                            value={profile.gender || ""}
                            onChange={(val) => setProfile({ ...profile, gender: val })}
                            fontFamily="'Segoe UI', sans-serif"
                          >
                            <HStack spacing={6}>
                              <Radio value="Male" colorScheme="blue" fontFamily="'Segoe UI', sans-serif">Male</Radio>
                              <Radio value="Female" colorScheme="blue" fontFamily="'Segoe UI', sans-serif">Female</Radio>
                              <Radio value="Other" colorScheme="blue" fontFamily="'Segoe UI', sans-serif">Other</Radio>
                            </HStack>
                          </RadioGroup>
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">{profile.gender || "-"}</Text>
                        )}
                      </FormControl>

                      {/* Phone */}
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaPhone} mr={2} /> Phone Number
                        </FormLabel>
                        {isEditing ? (
                          <Input
                            value={profile.phone || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                            placeholder="Your phone number"
                            size="lg"
                            borderRadius="md"
                            focusBorderColor={accentColor}
                            boxShadow="sm"
                            fontFamily="'Segoe UI', sans-serif"
                          />
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">{profile.phone || "-"}</Text>
                        )}
                      </FormControl>

                      {/* Address */}
                      <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaMapMarkerAlt} mr={2} /> Address
                        </FormLabel>
                        {isEditing ? (
                          <Textarea
                            value={profile.address || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, address: e.target.value })
                            }
                            placeholder="Your complete address"
                            rows={3}
                            size="lg"
                            borderRadius="md"
                            focusBorderColor={accentColor}
                            boxShadow="sm"
                            fontFamily="'Segoe UI', sans-serif"
                          />
                        ) : (
                          <Text fontSize="lg" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">{profile.address || "-"}</Text>
                        )}
                      </FormControl>
                    </Grid>
                  </Box>

                  {/* Educational Information Section */}
                  <Box>
                    <Heading as="h3" size="lg" color="blue.800" mb={4} display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                      <Center w="10" h="10" borderRadius="md" bg="blue.100" mr={3} boxShadow="inner">
                        <Icon as={FaGraduationCap} color="blue.600" />
                      </Center>
                      Educational Information
                    </Heading>
                    <Divider mb={6} />
                    
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
                      {/* College - Increased space for long college names */}
                      <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaUniversity} mr={2} /> College
                        </FormLabel>
                        {isEditing ? (
                          <>
                            <Select
                              value={showCustomCollege ? "Other" : profile.college || ""}
                              onChange={handleCollegeChange}
                              size="lg"
                              borderRadius="md"
                              focusBorderColor={accentColor}
                              boxShadow="sm"
                              fontFamily="'Segoe UI', sans-serif"
                            >
                              <option value="">Select your college</option>
                              <option>Goa College of Engineering</option>
                              <option>Padre Conceicao College of Engineering</option>
                              <option>Shree Rayeshwar Institute of Engineering & IT</option>
                              <option>Agnel Institute of Technology and Design</option>
                              <option>Don Bosco College Of Engineering</option>
                              <option value="Other">Other</option>
                            </Select>
                            {showCustomCollege && (
                              <Input
                                value={profile.college || ""}
                                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                                placeholder="Enter your college name"
                                mt={3}
                                size="lg"
                                borderRadius="md"
                                focusBorderColor={accentColor}
                                boxShadow="sm"
                                fontFamily="'Segoe UI', sans-serif"
                              />
                            )}
                          </>
                        ) : (
                          <Text fontSize="lg" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" minH="60px" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                            {profile.college || "-"}
                          </Text>
                        )}
                      </FormControl>

                      {/* Branch */}
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaBook} mr={2} /> Branch
                        </FormLabel>
                        {isEditing ? (
                          <>
                            <Select
                              value={showCustomBranch ? "Other" : profile.branch || ""}
                              onChange={handleBranchChange}
                              size="lg"
                              borderRadius="md"
                              focusBorderColor={accentColor}
                              boxShadow="sm"
                              fontFamily="'Segoe UI', sans-serif"
                            >
                              <option value="">Select branch</option>
                              <option>Computer</option>
                              <option>Information Technology</option>
                              <option>Electronics And Telecommunication</option>
                              <option>Electronics And Computer Science</option>
                              <option>Computer Science and AIML</option>
                              <option>Electrical</option>
                              <option>Mechanical</option>
                              <option value="Other">Other</option>
                            </Select>
                            {showCustomBranch && (
                              <Input
                                value={profile.branch || ""}
                                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                                placeholder="Enter your branch name"
                                mt={3}
                                size="lg"
                                borderRadius="md"
                                focusBorderColor={accentColor}
                                boxShadow="sm"
                                fontFamily="'Segoe UI', sans-serif"
                              />
                            )}
                          </>
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">{profile.branch || "-"}</Text>
                        )}
                      </FormControl>

                      {/* CGPA */}
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaStar} mr={2} /> CGPA (0-10 scale)
                        </FormLabel>
                        {isEditing ? (
                          <Input
                            value={profile.cgpa || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, cgpa: e.target.value })
                            }
                            placeholder="Your CGPA"
                            size="lg"
                            borderRadius="md"
                            focusBorderColor={accentColor}
                            boxShadow="sm"
                            fontFamily="'Segoe UI', sans-serif"
                          />
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">{profile.cgpa || "-"}</Text>
                        )}
                      </FormControl>

                      {/* Year of Study */}
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaCalendarAlt} mr={2} /> Year of Study
                        </FormLabel>
                        {isEditing ? (
                          <Select
                            value={profile.yearOfStudy || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, yearOfStudy: e.target.value })
                            }
                            size="lg"
                            borderRadius="md"
                            focusBorderColor={accentColor}
                            boxShadow="sm"
                            fontFamily="'Segoe UI', sans-serif"
                          >
                            <option value="">Select year</option>
                            <option>1st Year</option>
                            <option>2nd Year</option>
                            <option>3rd Year</option>
                            <option>4th Year</option>
                          </Select>
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">{profile.yearOfStudy || "-"}</Text>
                        )}
                      </FormControl>
                    </Grid>
                  </Box>

                  {/* Professional Information Section */}
                  <Box>
                    <Heading as="h3" size="lg" color="blue.800" mb={4} display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                      <Center w="10" h="10" borderRadius="md" bg="blue.100" mr={3} boxShadow="inner">
                        <Icon as={FaBriefcase} color="blue.600" />
                      </Center>
                      Professional Information
                    </Heading>
                    <Divider mb={6} />
                    
                    {/* About */}
                    <FormControl mb={8}>
                      <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                        <Icon as={FaGlobe} mr={2} /> About Your Experience (Optional)
                      </FormLabel>
                      {isEditing ? (
                        <Textarea
                            value={profile.about || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, about: e.target.value })
                            }
                            placeholder="Describe your previous work experience, projects, or achievements"
                            rows={4}
                            size="lg"
                            borderRadius="md"
                            focusBorderColor={accentColor}
                            boxShadow="sm"
                            fontFamily="'Segoe UI', sans-serif"
                          />
                        ) : (
                          <Text fontSize="lg" p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" minH="120px" fontFamily="'Segoe UI', sans-serif">
                            {profile.about || "No experience added yet."}
                          </Text>
                        )}
                      </FormControl>

                      {/* Skills - Added extra space for skills section */}
                      <FormControl mb={10}>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaLightbulb} mr={2} /> Skills & Expertise
                        </FormLabel>
                        {isEditing ? (
                          <>
                            <HStack mb={4}>
                              <Input
                                placeholder="e.g. React, Python, UI/UX"
                                value={inputSkill}
                                onChange={(e) => setInputSkill(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), handleAddSkill(inputSkill))
                                }
                                size="lg"
                                borderRadius="md"
                                focusBorderColor={accentColor}
                                boxShadow="sm"
                                fontFamily="'Segoe UI', sans-serif"
                              />
                              <MotionButton 
                                onClick={() => handleAddSkill(inputSkill)} 
                                colorScheme="blue"
                                isDisabled={!inputSkill.trim()}
                                size="lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                fontFamily="'Segoe UI', sans-serif"
                              >
                                Add
                              </MotionButton>
                            </HStack>

                            <Text fontSize="sm" color="gray.600" mb={2} fontFamily="'Segoe UI', sans-serif">
                              Quick add popular skills:
                            </Text>
                            <Wrap spacing={2} mb={4}>
                              {topSkills.map((skill) => (
                                <MotionButton
                                  key={skill}
                                  size="sm"
                                  variant="outline"
                                  colorScheme="blue"
                                  onClick={() => handleAddSkill(skill)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  fontFamily="'Segoe UI', sans-serif"
                                >
                                  {skill}
                                </MotionButton>
                              ))}
                            </Wrap>

                            <Box minH="140px" p={3} border="1px dashed" borderColor="gray.200" borderRadius="md" mb={4}>
  <Text fontSize="sm" color="gray.500" mb={3} fontFamily="'Segoe UI', sans-serif">
    Your skills (click × to remove):
  </Text>
  <Wrap spacing={2}>
    {profile.skills && profile.skills.map((skill) => (
      <Tag
        key={skill}
        size="lg"
        borderRadius="full"
        variant="solid"
        colorScheme="blue"
        display="flex"
        alignItems="center"
        py={2.5}
        px={3}
        maxWidth="100%"
      >
        <TagLabel 
          fontFamily="'Segoe UI', sans-serif" 
          fontSize="md" 
          whiteSpace="normal"
          wordBreak="break-word"
          textAlign="center"
          lineHeight="1.4" 
        >
          {skill}
        </TagLabel>
        <TagCloseButton onClick={() => handleRemoveSkill(skill)} />
      </Tag>
    ))}
  </Wrap>
</Box>
                          </>
                        ) : (
                          <Box minH="120px" p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
  {profile.skills && profile.skills.length > 0 ? (
    <Wrap spacing={2}>
      {profile.skills.map((skill) => (
        <Tag 
          key={skill} 
          colorScheme="blue" 
          size="lg" 
          display="flex" 
          alignItems="center" 
          borderRadius="full"
          py={2.5}
          px={3}
          maxWidth="100%"
        >
          <TagLabel 
            fontFamily="'Segoe UI', sans-serif" 
            fontSize="md" 
            whiteSpace="normal"
            wordBreak="break-word"
            textAlign="center"
            lineHeight="1.5"
          >
            {skill}
          </TagLabel>
        </Tag>
      ))}
    </Wrap>
  ) : (
    <Text color="gray.500" fontFamily="'Segoe UI', sans-serif">No skills added yet.</Text>
  )}
</Box>
                        )}
                      </FormControl>

                      {/* Social Links */}
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={8}>
                        {/* LinkedIn */}
                        <FormControl>
                          <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                            <Icon as={FaLinkedin} mr={2} /> LinkedIn Profile
                          </FormLabel>
                          {isEditing ? (
                            <Input
                              value={profile.linkedin || ""}
                              onChange={(e) =>
                                setProfile({ ...profile, linkedin: e.target.value })
                              }
                              placeholder="Your LinkedIn profile URL"
                              size="lg"
                              borderRadius="md"
                              focusBorderColor={accentColor}
                              boxShadow="sm"
                              fontFamily="'Segoe UI', sans-serif"
                            />
                          ) : (
                            <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">
                              {profile.linkedin ? (
                                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{color: '#3182CE'}}>
                                  View Profile
                                </a>
                              ) : "-"}
                            </Text>
                          )}
                        </FormControl>

                        {/* GitHub */}
                        <FormControl>
                          <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                            <Icon as={FaGithub} mr={2} /> GitHub Profile
                          </FormLabel>
                          {isEditing ? (
                            <Input
                              value={profile.github || ""}
                              onChange={(e) =>
                                setProfile({ ...profile, github: e.target.value })
                              }
                              placeholder="Your GitHub profile URL"
                              size="lg"
                              borderRadius="md"
                              focusBorderColor={accentColor}
                              boxShadow="sm"
                              fontFamily="'Segoe UI', sans-serif"
                            />
                          ) : (
                            <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontFamily="'Segoe UI', sans-serif">
                              {profile.github ? (
                                <a href={profile.github} target="_blank" rel="noopener noreferrer" style={{color: '#3182CE'}}>
                                  View Profile
                                </a>
                              ) : "-"}
                            </Text>
                          )}
                        </FormControl>
                      </Grid>

                      {/* Resume */}
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaFilePdf} mr={2} /> Resume (PDF)
                        </FormLabel>
                        {isEditing ? (
                          <>
                            <Input 
                              type="file" 
                              accept="application/pdf" 
                              onChange={handleResumeChange} 
                              py={1}
                              size="lg"
                              borderRadius="md"
                              boxShadow="sm"
                              fontFamily="'Segoe UI', sans-serif"
                            />
                            {resumeFileName && (
                              <Text mt={2} fontSize="sm" color="gray.600" fontFamily="'Segoe UI', sans-serif">
                                Selected file: {resumeFileName}
                              </Text>
                            )}
                          </>
                        ) : (
                          profile.resume ? (
                            <MotionButton 
                              as="a" 
                              href={profile.resume} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              colorScheme="blue" 
                              variant="outline" 
                              leftIcon={<FaFilePdf />}
                              size="lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              fontFamily="'Segoe UI', sans-serif"
                            >
                              View Resume
                            </MotionButton>
                          ) : (
                            <Text color="gray.500" p={2} fontFamily="'Segoe UI', sans-serif">No resume uploaded.</Text>
                          )
                        )}
                      </FormControl>
                    </Box>

                    {/* Action Buttons */}
                    {isEditing && (
                      <HStack spacing={4} mt={8} justify="center">
                        <MotionButton 
                          colorScheme="blue" 
                          onClick={handleSave}
                          leftIcon={<FaSave />}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          size="lg"
                          px={8}
                          boxShadow="md"
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          Save Changes
                        </MotionButton>
                        <MotionButton 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          leftIcon={<FaTimes />}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          size="lg"
                          px={8}
                          fontFamily="'Segoe UI', sans-serif"
                        >
                          Cancel
                        </MotionButton>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </MotionCard>
            </GridItem>

            <GridItem>
              {/* Profile Status Card */}
              <MotionCard
                bg={cardBg}
                rounded="xl"
                shadow="xl"
                border="1px"
                borderColor={borderColor}
                fontFamily="'Segoe UI', sans-serif"
                mb={6}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading as="h3" size="md" color="blue.800" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                      <Center w="8" h="8" borderRadius="md" bg="blue.100" mr={2} boxShadow="inner">
                        <Icon as={FaAward} color="blue.600" />
                      </Center>
                      Profile Status
                    </Heading>
                    <Divider />
                    
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="medium" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaCheckCircle} mr={2} /> Completion
                        </Text>
                        <Text fontWeight="bold" color="blue.600" fontFamily="'Segoe UI', sans-serif">{profileCompletion}%</Text>
                      </HStack>
                      <Progress 
                        value={profileCompletion} 
                        size="sm" 
                        colorScheme="blue" 
                        borderRadius="full"
                        hasStripe={profileCompletion < 100}
                        isAnimated={profileCompletion < 100}
                      />
                    </Box>
                    
                    <Box>
                      <Text fontWeight="medium" mb={2} display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                        <Icon as={FaCalendarAlt} mr={2} /> Last Updated
                      </Text>
                      <Text color="gray.600" fontFamily="'Segoe UI', sans-serif">{new Date().toLocaleDateString('en-GB')}</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </MotionCard>

              {/* Quick Stats Card */}
              <MotionCard
                bg={cardBg}
                rounded="xl"
                shadow="xl"
                border="1px"
                borderColor={borderColor}
                fontFamily="'Segoe UI', sans-serif"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading as="h3" size="md" color="blue.800" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                      <Center w="8" h="8" borderRadius="md" bg="blue.100" mr={2} boxShadow="inner">
                        <Icon as={FaChartLine} color="blue.600" />
                      </Center>
                      Quick Stats
                    </Heading>
                    <Divider />
                    
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="medium" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaLightbulb} mr={2} /> Skills
                        </Text>
                        <Badge colorScheme="blue" fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                          {profile.skills ? profile.skills.length : 0}
                        </Badge>
                      </HStack>
                    </Box>
                    
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="medium" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaFilePdf} mr={2} /> Resume
                        </Text>
                        <Badge colorScheme={profile.resume ? "green" : "gray"} fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                          {profile.resume ? "Uploaded" : "Missing"}
                        </Badge>
                      </HStack>
                    </Box>
                    
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="medium" display="flex" alignItems="center" fontFamily="'Segoe UI', sans-serif">
                          <Icon as={FaUser} mr={2} /> Photo
                        </Text>
                        <Badge colorScheme={profile.profilePhoto ? "green" : "gray"} fontSize="sm" fontFamily="'Segoe UI', sans-serif">
                          {profile.profilePhoto ? "Uploaded" : "Missing"}
                        </Badge>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </MotionCard>
            </GridItem>
          </Grid>
        </Container>

        {/* Modal for viewing profile photo */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <Box p={4} textAlign="center">
              <Image
                src={profile?.profilePhoto || "/default.png"}
                alt="Profile Photo"
                borderRadius="md"
                maxH="70vh"
                objectFit="contain"
                mx="auto"
              />
              <Button mt={4} colorScheme="blue" onClick={onClose} fontFamily="'Segoe UI', sans-serif">
                Close
              </Button>
            </Box>
          </ModalContent>
        </Modal> 
      </Box>
    );
}