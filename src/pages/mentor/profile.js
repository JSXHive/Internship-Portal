import {
  Box,
  Heading,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  HStack,
  useColorModeValue,
  useToast,
  Text,
  Card,
  CardBody,
  Icon,
  Flex,
  Avatar,
  Divider,
  Grid,
  GridItem,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useDisclosure,
  Container,
  Center,
  Image,
  Spinner,
  keyframes,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaAward,
  FaIdBadge,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaEye,
  FaArrowLeft,
  FaUser,
  FaRocket,
  FaCamera,
  FaStar,
  FaTrophy,
} from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

// Keyframes for animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0,-30px,0); }
  70% { transform: translate3d(0,-15px,0); }
  90% { transform: translate3d(0,-4px,0); }
`;

export default function MentorProfilePage() {
  const toast = useToast();
  const router = useRouter();
  const cardBg = useColorModeValue("white", "gray.800");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const profileCompletionColor = useColorModeValue("blue.50", "blue.900");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const gradientBg = useColorModeValue(
    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
  );
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contact_no: "",
    designation: "",
    area_of_expertise: "",
    years_of_experience: "",
    profile_photo: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoFileName, setProfilePhotoFileName] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);

  // Calculate profile completion percentage
  const calculateProfileCompletion = useCallback((profileData) => {
    if (!profileData) return 0;
    const fields = [
      "name", "email", "contact_no", "designation", "area_of_expertise", "years_of_experience", "profile_photo"
    ];
    let completed = 0;
    fields.forEach(field => {
      if (profileData[field]) {
        completed++;
      }
    });
    return Math.round((completed / fields.length) * 100);
  }, []);

  // Essential toast notifications only
  const showErrorToast = useCallback((title, description = "") => {
    toast({
      title,
      description,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });
  }, [toast]);

  const showSuccessToast = useCallback((title, description = "") => {
    toast({
      title,
      description,
      status: "success",
      duration: 4000,
      isClosable: true,
      position: "top-right",
    });
  }, [toast]);

  const getFileNameFromPath = useCallback((path) => {
    if (!path) return "";
    return path.split('/').pop();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          showErrorToast("Access Required", "Please log in to view your profile");
          router.push("/login");
          return;
        }
        
        const user = JSON.parse(storedUser);
        const userId = localStorage.getItem("userId");
        if (!userId) {
          showErrorToast("Session Expired", "Please log in again to continue");
          router.push("/login");
          return;
        }
        
        // Fetch mentor profile
        const res = await fetch(`/api/mentor/profile?userId=${userId}`);
        if (res.status === 404) {
          setIsEditing(true);
          setProfile(prevProfile => ({ ...prevProfile, name: user.name, email: user.email }));
          setProfileCompletion(0);
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        setProfile(data.profile);
        if (data.profile.profile_photo) {
          setProfilePreview(data.profile.profile_photo);
          setProfilePhotoFileName(getFileNameFromPath(data.profile.profile_photo));
        }
        const newCompletion = calculateProfileCompletion(data.profile);
        setProfileCompletion(newCompletion);
        
      } catch (e) {
        setIsEditing(true);
        showErrorToast("Loading Issue", "We encountered a problem loading your profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [
    router, 
    calculateProfileCompletion, 
    showErrorToast, 
    getFileNameFromPath
  ]);

  const handleProfilePhotoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Strict 1MB validation
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      showErrorToast(
        "File Too Large",
        "Please choose an image smaller than 1MB for optimal performance"
      );
      // Reset the file input
      e.target.value = "";
      setProfilePhotoFileName("");
      return;
    }
    
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setProfilePhotoFile(file);
      setProfilePhotoFileName(file.name);
      const previewURL = URL.createObjectURL(file);
      setProfilePreview(previewURL);
    } else {
      showErrorToast(
        "Invalid Format",
        "Please upload a JPG or PNG image only"
      );
      // Reset the file input
      e.target.value = "";
      setProfilePhotoFileName("");
    }
  }, [showErrorToast]);

  const handleSave = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const formData = new FormData();
      formData.append("userId", userId);
      Object.entries(profile).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      if (profilePhotoFile) {
        formData.append("profile_photo", profilePhotoFile);
      }
      
      const res = await fetch("/api/mentor/createprofile", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Failed to save profile");
      
      showSuccessToast(
        "Profile Updated!",
        "Your changes have been saved successfully"
      );
      
      setIsEditing(false);
      
      // Reload after a short delay to show the toast
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (e) {
      showErrorToast(
        "Save Failed",
        "We couldn't save your changes. Please check your connection and try again."
      );
    }
  }, [profile, profilePhotoFile, showSuccessToast, showErrorToast]);

  const handleBackToDashboard = useCallback(() => {
    router.push("/mentor/dashboard");
  }, [router]);

  const handleEditToggle = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    // Reset profile preview to original when canceling
    if (profile.profile_photo) {
      setProfilePreview(profile.profile_photo);
    }
    setProfilePhotoFile(null);
    setProfilePhotoFileName("");
  }, [profile.profile_photo]);

  if (loading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box 
            p={6} 
            borderRadius="xl" 
            bgGradient={gradientBg}
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaUser} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color={accentColor} />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">Loading your profile information...</Text>
          <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" fontFamily="'Segoe UI', sans-serif">
      <Box bgGradient="linear(to-r, blue.600, purple.700)" color="white" py={4}>
        <Container maxW="6xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <MotionButton
              bg="transparent"
              color="white"
              border="1px solid"
              borderColor="whiteAlpha.400"
              variant="outline"
              onClick={handleBackToDashboard}
              leftIcon={<FaArrowLeft />}
              size="md"
              _hover={{ bg: "whiteAlpha.100" }}
              flexShrink={0}
            >
              Back to Dashboard
            </MotionButton>
            <MotionBox textAlign="center" flex="1" minW="300px">
              <Heading size="xl" fontWeight="700">Mentor Profile</Heading>
              <Text fontSize="md" opacity={0.8} mt={1}>Build your professional profile and showcase your expertise</Text>
            </MotionBox>
            <Box w="136px" flexShrink={0} display={{ base: "none", md: "block" }} />
          </Flex>
        </Container>
      </Box>
      
      <Container maxW="6xl" py={8}>
        <MotionCard bg={profileCompletionColor} borderLeft="4px" borderColor="blue.500" mb={8}>
          <CardBody p={6}>
            <Flex direction={{ base: "column", md: "row" }} alignItems="center" justifyContent="space-between">
              <HStack spacing={4} mb={{ base: 4, md: 0 }} flexWrap="wrap">
                <Center w="60px" h="60px" borderRadius="full" bg="blue.100">
                  <Icon as={FaUserTie} boxSize={6} color="blue.600" />
                </Center>
                <Box>
                  <Text fontWeight="bold" color="blue.800" mb={1}>Profile Completion: {profileCompletion}%</Text>
                  <Progress value={profileCompletion} size="sm" colorScheme="blue" borderRadius="full" w={{ base: "100%", md: "300px" }} />
                  <Text fontSize="sm" color="blue.700" mt={2}>Complete your profile to increase your visibility to students</Text>
                </Box>
              </HStack>
              {!isEditing && (
                <MotionButton 
                  colorScheme="blue" 
                  onClick={handleEditToggle}
                  leftIcon={<FaEdit />} 
                  size="lg" 
                  mt={{ base: 4, md: 0 }}
                >
                  Edit Profile
                </MotionButton>
              )}
            </Flex>
          </CardBody>
        </MotionCard>
        
        <Grid templateColumns={{ base: "1fr", lg: "3fr 1fr" }} gap={8}>
          <GridItem>
            <MotionCard bg={cardBg} rounded="xl" shadow="lg" border="1px" borderColor={borderColor}>
              <CardBody p={{ base: 4, md: 8 }}>
                <VStack spacing={8} align="stretch">
                  {/* Personal Information Section */}
                  <Box>
                    <Heading as="h3" size="lg" color="blue.800" mb={4} display="flex" alignItems="center">
                      <Center w="10" h="10" borderRadius="md" bg="blue.100" mr={3}>
                        <Icon as={FaUserTie} color="blue.600" />
                      </Center>
                      Personal Information
                    </Heading>
                    <Divider mb={6} />
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
                      {/* Profile Photo */}
                      <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaUserTie} mr={2} /> Profile Photo
                        </FormLabel>
                        <HStack spacing={4} flexWrap="wrap">
                          {isEditing ? (
                            <>
                              <Box>
                                <Input 
                                  type="file" 
                                  id="profile-photo-input"
                                  accept="image/jpeg, image/png" 
                                  onChange={handleProfilePhotoChange} 
                                  py={1} 
                                  fontSize="sm" 
                                  display="none"
                                />
                                <label htmlFor="profile-photo-input">
                                  <Button as="span" colorScheme="blue" size="md" cursor="pointer">
                                    Choose File
                                  </Button>
                                </label>
                                {profilePhotoFileName && (
                                  <Box mt={2}>
                                    <Text fontSize="sm" color="gray.600">
                                      Selected file: {profilePhotoFileName}
                                    </Text>
                                    <Text fontSize="xs" color="blue.600" mt={1}>
                                      Max size: 1MB | Formats: JPG, PNG
                                    </Text>
                                  </Box>
                                )}
                                {(profilePreview || profile.profile_photo) && (
                                  <Image 
                                    src={profilePreview || profile.profile_photo} 
                                    alt="Profile Preview" 
                                    boxSize="120px" 
                                    borderRadius="full" 
                                    mt={3} 
                                    objectFit="cover" 
                                    border="3px solid" 
                                    borderColor="blue.100" 
                                  />
                                )}
                              </Box>
                            </>
                          ) : (
                            <>
                              <Avatar 
                                src={profile.profile_photo || "/default.png"} 
                                alt="Profile" 
                                size="xl" 
                                border="3px solid" 
                                borderColor="blue.100" 
                              />
                              {profile.profile_photo && (
                                <Button 
                                  leftIcon={<FaEye />} 
                                  colorScheme="blue" 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={onOpen}
                                >
                                  View Full Size
                                </Button>
                              )}
                            </>
                          )}
                        </HStack>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaUserTie} mr={2} /> Full Name
                        </FormLabel>
                        {isEditing ? (
                          <Input 
                            value={profile.name || ""} 
                            onChange={e => setProfile({ ...profile, name: e.target.value })} 
                            placeholder="Your full name" 
                            size="lg" 
                            borderRadius="md" 
                            focusBorderColor={accentColor} 
                          />
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md">{profile.name || "-"}</Text>
                        )}
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaEnvelope} mr={2} /> Email Address
                        </FormLabel>
                        <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md" color="gray.600">{profile.email || "-"}</Text>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaPhone} mr={2} /> Contact Number
                        </FormLabel>
                        {isEditing ? (
                          <Input 
                            value={profile.contact_no || ""} 
                            onChange={e => setProfile({ ...profile, contact_no: e.target.value })} 
                            placeholder="Your contact number" 
                            size="lg" 
                            borderRadius="md" 
                            focusBorderColor={accentColor} 
                          />
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md">{profile.contact_no || "-"}</Text>
                        )}
                      </FormControl>
                    </Grid>
                  </Box>

                  {/* Professional Information Section */}
                  <Box>
                    <Heading as="h3" size="lg" color="blue.800" mb={4} display="flex" alignItems="center">
                      <Center w="10" h="10" borderRadius="md" bg="blue.100" mr={3}>
                        <Icon as={FaAward} color="blue.600" />
                      </Center>
                      Professional Information
                    </Heading>
                    <Divider mb={6} />
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaIdBadge} mr={2} /> Designation
                        </FormLabel>
                        {isEditing ? (
                          <Input 
                            value={profile.designation || ""} 
                            onChange={e => setProfile({ ...profile, designation: e.target.value })} 
                            placeholder="Your designation" 
                            size="lg" 
                            borderRadius="md" 
                            focusBorderColor={accentColor} 
                          />
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md">{profile.designation || "-"}</Text>
                        )}
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaAward} mr={2} /> Area of Expertise
                        </FormLabel>
                        {isEditing ? (
                          <Input 
                            value={profile.area_of_expertise || ""} 
                            onChange={e => setProfile({ ...profile, area_of_expertise: e.target.value })} 
                            placeholder="Your area of expertise" 
                            size="lg" 
                            borderRadius="md" 
                            focusBorderColor={accentColor} 
                          />
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md">{profile.area_of_expertise || "-"}</Text>
                        )}
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaAward} mr={2} /> Years of Experience
                        </FormLabel>
                        {isEditing ? (
                          <Input 
                            value={profile.years_of_experience || ""} 
                            onChange={e => setProfile({ ...profile, years_of_experience: e.target.value })} 
                            placeholder="Years of experience" 
                            size="lg" 
                            borderRadius="md" 
                            focusBorderColor={accentColor} 
                          />
                        ) : (
                          <Text fontSize="lg" p={2} bg="gray.50" borderRadius="md">{profile.years_of_experience || "-"}</Text>
                        )}
                      </FormControl>
                    </Grid>
                  </Box>
                  
                  {isEditing && (
                    <HStack spacing={4} mt={8} justify="center" flexWrap="wrap">
                      <MotionButton 
                        colorScheme="blue" 
                        onClick={handleSave} 
                        leftIcon={<FaSave />} 
                        size="lg" 
                        px={8} 
                        mb={{ base: 2, md: 0 }}
                      >
                        Save Changes
                      </MotionButton>
                      <MotionButton 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        leftIcon={<FaTimes />} 
                        size="lg" 
                        px={8}
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
            <MotionCard bg={cardBg} rounded="xl" shadow="lg" border="1px" borderColor={borderColor} mb={6}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading as="h3" size="md" color="blue.800" display="flex" alignItems="center">
                    <Center w="8" h="8" borderRadius="md" bg="blue.100" mr={2}>
                      <Icon as={FaCheckCircle} color="blue.600" />
                    </Center>
                    Profile Status
                  </Heading>
                  <Divider />
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium" display="flex" alignItems="center">
                        <Icon as={FaCheckCircle} mr={2} /> Completion
                      </Text>
                      <Text fontWeight="bold" color="blue.600">{profileCompletion}%</Text>
                    </HStack>
                    <Progress value={profileCompletion} size="sm" colorScheme="blue" borderRadius="full" />
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2} display="flex" alignItems="center">
                      <Icon as={FaAward} mr={2} /> Last Updated
                    </Text>
                    <Text color="gray.600">{new Date().toLocaleDateString('en-GB')}</Text>
                  </Box>
                </VStack>
              </CardBody>
            </MotionCard>
          </GridItem>
        </Grid>
      </Container>
      
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <Box p={4} textAlign="center">
            <Image 
              src={profilePreview || profile.profile_photo || "/default.png"} 
              alt="Profile Photo" 
              borderRadius="md" 
              maxH="70vh" 
              objectFit="contain" 
              mx="auto" 
            />
            <Button mt={4} colorScheme="blue" onClick={onClose}>Close</Button>
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
}