// pages/admin/students/[id].js
import {
  Box,
  Heading,
  Text,
  Flex,
  Avatar,
  Badge,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Link,
  useToast,
  Spinner,
  Center,
  Divider,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  HStack,
  VStack,
  Icon,
  Container,
  useColorModeValue,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { 
  FiArrowLeft, 
  FiMail, 
  FiDownload, 
  FiExternalLink,
  FiUser,
  FiCalendar,
  FiBook,
  FiAward,
  FiLinkedin,
  FiGithub,
  FiPhone,
  FiGlobe,
  FiStar,
  FiBookOpen,
  FiHome,
  FiCpu,
  FiFileText,
  FiEdit3,
  FiUsers,
  FiTarget,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";

export default function StudentProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const sectionBg = useColorModeValue("gray.50", "gray.700");

  const fetchProfile = useCallback(async () => {
    try {
      console.log('Fetching profile for student ID:', id);
      const res = await fetch(`/api/student/${id}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      
      const data = await res.json();
      console.log('Profile data received:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to load student profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      // Check if we have profile data in sessionStorage first
      const storedProfile = sessionStorage.getItem(`studentProfile_${id}`);
      
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          console.log('Using stored profile:', parsedProfile);
          setProfile(parsedProfile);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Error parsing stored profile data:", e);
          sessionStorage.removeItem(`studentProfile_${id}`);
        }
      }
      
      // Check if we have profile data in query params
      if (router.query.profile) {
        try {
          const profileData = JSON.parse(router.query.profile);
          console.log('Using profile from query params:', profileData);
          setProfile(profileData);
          sessionStorage.setItem(`studentProfile_${id}`, JSON.stringify(profileData));
          
          // Clean up the URL
          router.replace(`/admin/students/${id}`, undefined, { shallow: true });
        } catch (e) {
          console.error("Error parsing profile data from query:", e);
          fetchProfile();
        }
        setLoading(false);
      } else if (router.query.basic) {
        // Handle basic profile data from query params
        const basicProfile = {
          name: router.query.name,
          email: router.query.email,
          phone: router.query.contact,
          college: router.query.college,
          branch: router.query.branch,
          year_of_study: router.query.year,
          cgpa: router.query.cgpa,
          isBasic: true
        };
        console.log('Using basic profile:', basicProfile);
        setProfile(basicProfile);
        sessionStorage.setItem(`studentProfile_${id}`, JSON.stringify(basicProfile));
        setLoading(false);
        
        // Clean up the URL
        router.replace(`/admin/students/${id}`, undefined, { shallow: true });
      } else {
        fetchProfile();
      }
    }
  }, [id, router, fetchProfile]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const downloadResume = async (resumeUrl, applicantName) => {
    try {
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.setAttribute('download', `${applicantName}_Resume.pdf`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Resume download has started",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        title: "Download failed",
        description: "Could not download the resume",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading student profile...</Text>
        </VStack>
      </Center>
    );
  }

  if (error || !profile) {
    return (
      <Center minH="100vh" flexDirection="column" gap={6} p={4}>
        <Box textAlign="center">
          <Icon as={FiUser} boxSize={12} color="red.500" mb={4} />
          <Heading size="lg" color="red.500" mb={2}>Error loading profile</Heading>
          <Text color="gray.600" mb={4}>{error}</Text>
        </Box>
        <Button 
          leftIcon={<FiArrowLeft />} 
          onClick={() => router.push("/admin/requests")}
          colorScheme="blue"
          size="lg"
        >
          Back to Requests
        </Button>
      </Center>
    );
  }

  return (
    <Container maxW="1200px" p={{ base: 4, md: 6 }}>
      <Flex justify="flex-start" align="center" mb={6}>
        <Button 
          leftIcon={<FiArrowLeft />} 
          variant="outline" 
          onClick={() => router.push("/admin/requests")}
          colorScheme="blue"
          size="lg"
        >
          Back to Requests
        </Button>
      </Flex>

      <Card shadow="2xl" borderRadius="xl" overflow="hidden" bg={cardBg}>
        {/* Header Section */}
        <CardHeader 
          bg={headerBg} 
          borderBottom="1px" 
          borderColor={borderColor} 
          py={10}
          position="relative"
        >
          <Box
            position="absolute"
            top={4}
            right={4}
            bg="white"
            p={2}
            borderRadius="full"
            boxShadow="md"
          >
            <Icon as={FiUser} color="blue.500" boxSize={5} />
          </Box>
          
          <Flex align="center" gap={8} flexDirection={{ base: "column", md: "row" }}>
            <Box position="relative">
              <Avatar 
                name={profile.name} 
                size="2xl" 
                src={profile.profile_photo} 
                border="4px solid white"
                boxShadow="xl"
                bg="blue.100"
              />
              <Box
                position="absolute"
                bottom={2}
                right={2}
                bg="green.400"
                color="white"
                borderRadius="full"
                p={1}
                boxShadow="md"
              >
                <Icon as={FiUser} boxSize={3} />
              </Box>
            </Box>
            <Box textAlign={{ base: "center", md: "left" }}>
              <Heading size="2xl" color="blue.800" mb={3} fontWeight="bold">
                {profile.name}
              </Heading>
              <Text fontSize="lg" color="blue.600" mb={4} fontWeight="medium">
                {profile.title || "Student"} at {profile.college}
              </Text>
              <Flex align="center" justify={{ base: "center", md: "flex-start" }} mb={4}>
                <Icon as={FiMail} color="blue.600" mr={2} />
                <Text fontSize="lg" color="blue.600" fontWeight="medium">
                  {profile.email}
                </Text>
              </Flex>
              <HStack spacing={3} justify={{ base: "center", md: "flex-start" }} flexWrap="wrap">
                <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                  <Icon as={FaGraduationCap} mr={1} />
                  {profile.college}
                </Badge>
                <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                  <Icon as={FiBookOpen} mr={1} />
                  {profile.branch}
                </Badge>
                <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
                  <Icon as={FiCalendar} mr={1} />
                  Year {profile.year_of_study}
                </Badge>
                <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
                  <Icon as={FiAward} mr={1} />
                  CGPA: {profile.cgpa}
                </Badge>
              </HStack>
            </Box>
          </Flex>
        </CardHeader>

        <CardBody p={8}>
          {/* Personal & Academic Information */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8} mb={10}>
            {/* Personal Information */}
            <Box>
              <SectionHeader icon={FiUser} title="Personal Information" color="yellow" />
              <VStack align="start" spacing={5}>
                <InfoItem icon={FiUser} label="Full Name" value={profile.name} />
                <InfoItem icon={FiMail} label="Email" value={profile.email} />
                <InfoItem icon={FiPhone} label="Phone" value={profile.phone} />
                <InfoItem icon={FiCalendar} label="Date of Birth" value={formatDate(profile.dob)} />
                <InfoItem icon={FiUsers} label="Gender" value={profile.gender} />
                <InfoItem icon={FiHome} label="Address" value={profile.address} />
              </VStack>
            </Box>

            {/* Academic Information */}
            <Box>
              <SectionHeader icon={FaGraduationCap} title="Academic Information" color="green" />
              <VStack align="start" spacing={5}>
                <InfoItem icon={FiBook} label="College" value={profile.college} />
                <InfoItem icon={FiCpu} label="Branch" value={profile.branch} />
                <InfoItem icon={FiCalendar} label="Year of Study" value={`Year ${profile.year_of_study}`} />
                <InfoItem icon={FiAward} label="CGPA" value={profile.cgpa} />
              </VStack>
            </Box>
          </Grid>

          <Divider my={10} borderColor={borderColor} />

          {/* Skills and Expertise */}
          {profile.skills && profile.skills !== "Null" && (
            <Box mb={10}>
              <SectionHeader icon={FiStar} title="Skills & Expertise" color="purple" />
              <Wrap spacing={4}>
                {profile.skills.split(',').map((skill, index) => (
                  <WrapItem key={index}>
                    <Tag 
                      size="lg" 
                      colorScheme="blue" 
                      borderRadius="full"
                      variant="subtle"
                      px={5}
                      py={2}
                      minH="40px"
                      boxShadow="sm"
                      whiteSpace="normal"
                      textAlign="center"
                    >
                      <Icon as={FiStar} mr={2} color="blue.500" />
                      <TagLabel fontWeight="medium" whiteSpace="normal">
                        {skill.trim()}
                      </TagLabel>
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}

          {/* About Section */}
          {profile.about && profile.about !== "Null" && (
            <Box mb={10}>
              <SectionHeader icon={FiEdit3} title="About Experience" color="teal" />
              <Box
                p={6}
                bg={sectionBg}
                borderRadius="xl"
                borderLeft="4px solid"
                borderColor="teal.400"
                boxShadow="sm"
              >
                <Text 
                  fontSize="lg" 
                  lineHeight="1.8" 
                  color="gray.700"
                  fontStyle="italic"
                >
                  {profile.about}
                </Text>
              </Box>
            </Box>
          )}

          {/* Social Links */}
          {(profile.linkedin_url || profile.github_url) && (
            <Box mb={10}>
              <SectionHeader icon={FiGlobe} title="Social Links" color="pink" />
              <HStack spacing={4} flexWrap="wrap">
                {profile.linkedin_url && (
                  <SocialButton
                    icon={FiLinkedin}
                    label="LinkedIn"
                    href={profile.linkedin_url}
                    colorScheme="linkedin"
                  />
                )}
                {profile.github_url && (
                  <SocialButton
                    icon={FiGithub}
                    label="GitHub"
                    href={profile.github_url}
                    colorScheme="gray"
                  />
                )}
              </HStack>
            </Box>
          )}

          {/* Resume Section */}
          {profile.resume && (
            <Box mb={8}>
              <SectionHeader icon={FiFileText} title="Resume" color="orange" />
              <HStack spacing={4} flexWrap="wrap">
                <Button 
                  as="a" 
                  href={profile.resume} 
                  target="_blank"
                  leftIcon={<FiExternalLink />}
                  colorScheme="blue"
                  variant="solid"
                  size="lg"
                  px={8}
                  boxShadow="md"
                  _hover={{ textDecoration: "none" }}
                >
                  View Resume
                </Button>
                <Button 
                  leftIcon={<FiDownload />}
                  colorScheme="green"
                  variant="outline"
                  size="lg"
                  px={8}
                  onClick={() => downloadResume(profile.resume, profile.name)}
                  boxShadow="sm"
                >
                  Download Resume
                </Button>
              </HStack>
            </Box>
          )}

          {/* Basic Profile Notice */}
          {profile.isBasic && (
            <Box 
              mt={8} 
              p={6} 
              bg="yellow.50" 
              borderRadius="xl" 
              borderLeft="4px solid" 
              borderColor="yellow.400"
              boxShadow="sm"
            >
              <Flex align="center" mb={3}>
                <Icon as={FiUser} color="yellow.600" boxSize={6} mr={3} />
                <Heading size="md" color="yellow.800">
                  Basic Profile Notice
                </Heading>
              </Flex>
              <Text color="yellow.700" lineHeight="1.6">
                This is a basic profile created from application data. 
                The student may not have completed their full profile with additional details yet.
              </Text>
            </Box>
          )}
        </CardBody>
      </Card>
    </Container>
  );
}

// Reusable Section Header Component
function SectionHeader({ icon, title, color = "blue" }) {
  return (
    <Flex align="center" mb={6} gap={3}>
      <Box
        p={3}
        bg={`${color}.100`}
        borderRadius="lg"
        color={`${color}.600`}
        boxShadow="sm"
      >
        <Icon as={icon} boxSize={6} />
      </Box>
      <Heading size="lg" color={`${color}.700`}>
        {title}
      </Heading>
    </Flex>
  );
}

// Reusable InfoItem Component
function InfoItem({ icon, label, value }) {
  const valueColor = useColorModeValue("gray.700", "gray.200");
  
  return (
    <Flex align="center" gap={4} p={3} borderRadius="lg" _hover={{ bg: "gray.50" }}>
      <Box
        p={2}
        bg="blue.100"
        borderRadius="md"
        color="blue.600"
      >
        <Icon as={icon} boxSize={5} />
      </Box>
      <Box flex="1">
        <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={1}>
          {label}
        </Text>
        <Text fontSize="md" color={valueColor} fontWeight="medium">
          {value || 'Not specified'}
        </Text>
      </Box>
    </Flex>
  );
}

// Reusable Social Button Component
function SocialButton({ icon, label, href, colorScheme = "blue", variant = "solid" }) {
  return (
    <Button
      as="a"
      href={href}
      target="_blank"
      leftIcon={<Icon as={icon} />}
      colorScheme={colorScheme}
      variant={variant}
      size="lg"
      px={6}
      boxShadow="sm"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md", textDecoration: "none" }}
      transition="all 0.2s"
    >
      {label}
    </Button>
  );
}