import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  Flex,
  useColorModeValue,
  Image,
  Container,
  Card,
  CardBody,
  HStack,
  Button,
  keyframes,
  useBreakpointValue,
  Badge,
  List,
  ListItem,
  ListIcon
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { FaAward, FaCheckCircle, FaEnvelope, FaEye, FaFax, FaGlobe, FaHandshake, FaHistory, FaLightbulb, FaMapMarkerAlt, FaPhone, FaRocket, FaShieldAlt, FaBullseye, FaUserTie, FaUsers } from 'react-icons/fa';
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect } from "react";

// Framer motion wrappers
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionCard = motion(Card);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// Keyframes for animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function About() {
  // Disable browser navigation buttons
  useEffect(() => {
    const disableNavigation = (e) => {
      // Disable back button
      if (e.keyCode === 8 || 
          (e.keyCode === 37 && e.altKey) || 
          (e.keyCode === 39 && e.altKey)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Disable right-click context menu
    const disableContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', disableNavigation);
    window.addEventListener('contextmenu', disableContextMenu);
    
    // Disable forward/back navigation
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function() {
      window.history.go(1);
    };

    return () => {
      window.removeEventListener('keydown', disableNavigation);
      window.removeEventListener('contextmenu', disableContextMenu);
    };
  }, []);

  // Color scheme
  const headingColor = useColorModeValue("purple.800", "purple.300");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const cardBg = useColorModeValue("white", "gray.800");
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex direction="column" minH="100vh" fontFamily="'Segoe UI', sans-serif">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <Box flex="1">
        {/* Hero Section */}
<Box
  position="relative"
  overflow="hidden"
  fontFamily="'Segoe UI', sans-serif"
  bgGradient="linear(to-br, blue.50, purple.50)"
  minH="60vh"
  display="flex"
  alignItems="center"
>
  {/* Animated background elements */}
  <Box
    position="absolute"
    top="-10%"
    right="-5%"
    w="300px"
    h="300px"
    borderRadius="full"
    bg="blue.100"
    opacity="0.3"
    css={{
      animation: `pulse 8s ease-in-out infinite`,
    }}
  />
  <Box
    position="absolute"
    bottom="10%"
    left="-5%"
    w="200px"
    h="200px"
    borderRadius="full"
    bg="purple.100"
    opacity="0.3"
    css={{
      animation: `pulse 6s ease-in-out infinite reverse`,
    }}
  />
  
  {/* Additional animated tech elements */}
  <Box
    position="absolute"
    top="20%"
    left="10%"
    w="100px"
    h="100px"
    borderRadius="20px"
    bg="blue.200"
    opacity="0.2"
    css={{
      animation: `pulse 5s ease-in-out infinite alternate`,
    }}
  />
  <Box
    position="absolute"
    bottom="20%"
    right="15%"
    w="120px"
    h="120px"
    borderRadius="20px"
    bg="purple.200"
    opacity="0.2"
    transform="rotate(45deg)"
    css={{
      animation: `pulse 7s ease-in-out infinite alternate-reverse`,
    }}
  />
  
  {/* Floating tech particles */}
  {[...Array(15)].map((_, i) => (
    <Box
      key={i}
      position="absolute"
      w="8px"
      h="8px"
      borderRadius="full"
      bg={i % 3 === 0 ? "blue.300" : i % 3 === 1 ? "purple.300" : "blue.400"}
      opacity="0.6"
      left={`${Math.random() * 100}%`}
      top={`${Math.random() * 100}%`}
      css={{
        animation: `floatUpDown ${5 + (i % 5)}s ease-in-out infinite ${i * 0.2}s`,
      }}
    />
  ))}
  
  <Container maxW="7xl" position="relative" zIndex={1}>
    <VStack spacing={6} textAlign="center" py={12}>
      <MotionHeading
        as="h1"
        size="2xl"
        fontWeight="bold"
        color="blue.900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        textShadow="0 2px 4px rgba(0,0,0,0.1)"
      >
        About <Box as="span" color="purple.600" position="relative">
          Info Tech Corporation Of Goa
          <Box 
            as="span"
            position="absolute"
            bottom="-5px"
            left="0"
            w="100%"
            h="3px"
            bgGradient="linear(to-r, blue.400, purple.500)"
            borderRadius="full"
          />
        </Box>
      </MotionHeading>
      <MotionText
        fontSize="xl"
        color="blue.800"
        maxW="2xl"
        fontWeight="500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        bg="whiteAlpha.700"
        p={3}
        borderRadius="lg"
        boxShadow="md"
      >
        Driving digital transformation and innovation across Goa
      </MotionText>
      
      {/* Tech stats counter */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        gap={8}
        mt={4}
      >
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="purple.600">
            50+
          </Text>
          <Text color="blue.800" fontWeight="medium">
            Digital Initiatives
          </Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="purple.600">
            1000+
          </Text>
          <Text color="blue.800" fontWeight="medium">
            Projects Completed
          </Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="purple.600">
            15+
          </Text>
          <Text color="blue.800" fontWeight="medium">
            Years of Excellence
          </Text>
        </Box>
      </MotionBox>
    </VStack>
  </Container>
  
  <style>
    {`
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.05); opacity: 0.4; }
      }
      @keyframes floatUpDown {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `}
  </style>
</Box>
        {/* Overview Section */}
        <Box py={16} px={{ base: 4, md: 8 }} bg="white">
          <Container maxW="6xl">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
              <MotionBox
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                position="relative"
                overflow="hidden"
                borderRadius="2xl"
                boxShadow="xl"
                border="8px solid"
                borderColor="white"
              >
                <Image
                  src="/itg-office.png"
                  alt="IT Hub Goa"
                  width="100%"
                  height="auto"
                  objectFit="contain"
                  bg="gray.100"
                />
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  bgGradient="linear(to-t, blackAlpha.800, transparent)"
                  color="white"
                  p={4}
                >
                </Box>
              </MotionBox>
              <MotionVStack
                spacing={6}
                align="start"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Badge colorScheme="purple" fontSize="md" p={2} borderRadius="md">
                  Who We Are
                </Badge>
                <Heading as="h2" size="xl" color={headingColor}>
                  Overview
                </Heading>
                <Text fontSize="lg" color={textColor}>
                  Info Tech Corporation of Goa Limited (ITG) is a Government of Goa undertaking 
                  established to provide comprehensive IT solutions and services to various 
                  government departments and agencies.
                </Text>
                <Text fontSize="lg" color={textColor}>
                  As the nodal IT agency for the state, we are committed to driving digital 
                  transformation, enhancing governance, and empowering citizens through technology.
                </Text>
                <Box
                  bg="purple.50"
                  p={4}
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="purple.500"
                  mt={4}
                >
                  <Text fontSize="lg" color="purple.800" fontStyle="italic">
                    &quot;Our company is dedicated to delivering comprehensive IT services tailored to the 
                    unique requirements of various government departments, while also championing 
                    their online visibility and promotion.&quot;
                  </Text>
                </Box>
              </MotionVStack>
            </SimpleGrid>
          </Container>
        </Box>

        {/* Mission & Vision Section */}
        <Box py={16} px={{ base: 4, md: 8 }} bg="gray.50">
          <Container maxW="6xl">
            <VStack spacing={12}>
              <MotionVStack
                spacing={4}
                textAlign="center"
                maxW="2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Heading as="h2" size="xl" color={headingColor}>
                  Our Purpose
                </Heading>
                <Text fontSize="lg" color={textColor}>
                  Guiding principles that drive our mission
                </Text>
              </MotionVStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <PurposeCard
                    icon={FaBullseye}
                    title="Mission"
                    description="To provide innovative, secure, and efficient IT solutions that transform governance, enhance public service delivery, and empower the citizens of Goa."
                    color="blue"
                  />
                </MotionBox>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <PurposeCard
                    icon={FaEye}
                    title="Vision"
                    description="To establish Goa as a model digital state with transparent, accessible, and citizen-centric governance powered by cutting-edge technology."
                    color="purple"
                  />
                </MotionBox>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Core Values Section */}
        <Box py={16} px={{ base: 4, md: 8 }} bg="white">
          <Container maxW="6xl">
            <VStack spacing={12}>
              <MotionVStack
                spacing={4}
                textAlign="center"
                maxW="2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Heading as="h2" size="xl" color={headingColor}>
                  Our Core Values
                </Heading>
                <Text fontSize="lg" color={textColor}>
                  The principles that guide everything we do
                </Text>
              </MotionVStack>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} width="100%">
                <ValueCard
                  icon={FaShieldAlt}
                  title="Integrity & Security"
                  description="We maintain the highest standards of ethics and data security in all our operations."
                  color="blue"
                />
                <ValueCard
                  icon={FaUsers}
                  title="Citizen-Centric Approach"
                  description="Our solutions are designed with the end-user in mind, ensuring accessibility and ease of use."
                  color="green"
                />
                <ValueCard
                  icon={FaRocket}
                  title="Innovation"
                  description="We continuously explore new technologies and approaches to improve governance."
                  color="purple"
                />
                <ValueCard
                  icon={FaHandshake}
                  title="Collaboration"
                  description="We work closely with government departments to understand their unique needs."
                  color="orange"
                />
                <ValueCard
                  icon={FaCheckCircle}
                  title="Excellence"
                  description="We strive for quality in every project, delivering reliable and efficient solutions."
                  color="teal"
                />
                <ValueCard
                  icon={FaLightbulb}
                  title="Transparency"
                  description="We believe in open processes and clear communication with all stakeholders."
                  color="red"
                />
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

                {/* Stats Section */}
        <Box py={16} px={{ base: 4, md: 8 }} bg="gray.50" fontFamily="'Segoe UI', sans-serif">
          <Container maxW="6xl">
            <VStack spacing={12}>
              <MotionVStack
                spacing={4}
                textAlign="center"
                maxW="2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Heading as="h2" size="xl" color={headingColor}>
                  Our Impact
                </Heading>
                <Text fontSize="lg" color={textColor}>
                  Driving digital transformation across Goa
                </Text>
              </MotionVStack>
              
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} width="100%">
                <StatCard
                  number="50+"
                  label="Government Departments Served"
                  icon={FaUsers}
                  color="blue"
                  delay={0.1}
                />
                <StatCard
                  number="100+"
                  label="Projects Completed"
                  icon={FaCheckCircle}
                  color="green"
                  delay={0.2}
                />
                <StatCard
                  number="15+"
                  label="Years of Service"
                  icon={FaHistory}
                  color="purple"
                  delay={0.3}
                />
                <StatCard
                  number="1M+"
                  label="Citizens Impacted"
                  icon={FaAward}
                  color="orange"
                  delay={0.4}
                />
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Board of Directors Section */}
        <Box py={16} px={{ base: 4, md: 8 }} bg="white" fontFamily="'Segoe UI', sans-serif">
          <Container maxW="6xl">
            <VStack spacing={12}>
              <MotionVStack
                spacing={4}
                textAlign="center"
                maxW="2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Heading as="h2" size="xl" color={headingColor}>
                  Board of Directors
                </Heading>
                <Text fontSize="lg" color={textColor}>
                  Leadership guiding InfoTech Corporation of Goa Ltd.
                </Text>
              </MotionVStack>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} width="100%">
                <DirectorCard
                  name="Dr. Chandrakant Shetye"
                  position="Chairman"
                />
                <DirectorCard
                  name="Shri. Sanjeev Ahuja (IAS)"
                  position="Secretary (IT)"
                />
                <DirectorCard
                  name="Shri. Harish Adconkar"
                  position="MD(GSIDC)"
                />
                <DirectorCard
                  name="Mr. Kabir Shirgaonkar"
                  position="Director(DITEC)"
                />
                <DirectorCard
                  name="Shri. Rajan Anand Kadkade"
                  position="Director"
                  address="H. No. 44, Bhiturlipeth, Bicholim - Goa"
                />
                <DirectorCard
                  name="Shri. Jerry Mathew"
                  position="Director"
                  address="H.No. 894/3, PundalikNagar, Porvorim - Goa"
                />
                <DirectorCard
                  name="Shri. Nagraj Prabhu Borkar"
                  position="Director"
                  address="House No. 288, Dongorwado, Near PWD Office, Fatorda, Margao, Goa"
                />
                <DirectorCard
                  name="Shri. Praveen Volvotkar"
                  position="MD(ITG) - Member Secretary"
                />
                <DirectorCard
                  name="Dr. Dinesh Amonkar"
                  position="Director"
                  address="Govind Smriti, Awachitwada, Bicholim - Goa"
                />
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Contact & Map Section */}
        <Box py={16} px={{ base: 4, md: 8 }} bg="gray.50" fontFamily="'Segoe UI', sans-serif">
          <Container maxW="6xl">
            <VStack spacing={12}>
              <MotionVStack
                spacing={4}
                textAlign="center"
                maxW="2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Heading as="h2" size="xl" color={headingColor}>
                  Let&#39;s Connect
                </Heading>
                <Text fontSize="lg" color={textColor}>
                  Get in touch with InfoTech Corporation of Goa
                </Text>
              </MotionVStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} width="100%">
                {/* Contact Information */}
                <MotionVStack
                  spacing={6}
                  align="start"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heading as="h3" size="lg" color={headingColor}>
                    Our Main Office
                  </Heading>
                  
                  <ContactItem
                    icon={FaMapMarkerAlt}
                    title="Address"
                    content="IT HUB, 3rd Floor, Altinho, Panaji-Goa 403 001"
                  />
                  
                  <ContactItem
                    icon={FaPhone}
                    title="Phone Number"
                    content="+91 (832) 2226024 / +91 (832) 2225192"
                  />
                  
                  <ContactItem
                    icon={FaFax}
                    title="Fax"
                    content="+91 (832) 2226024 / +91 (832) 2225192"
                  />
                  
                  <ContactItem
                    icon={FaEnvelope}
                    title="Mail"
                    content={
                      <VStack align="start" spacing={1}>
                        <Text>support@itcgi.in</Text>
                        <Text>itggoaj.helpdesk@gmail.com</Text>
                      </VStack>
                    }
                  />
                  
                  <Box pt={4}>
                    <Button 
                      colorScheme="blue" 
                      size="lg" 
                      rightIcon={<FaGlobe />}
                      as="a"
                      href="https://infotech.goa.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Official Website
                    </Button>
                  </Box>
                </MotionVStack>
                
                {/* Map Section */}
                <MotionBox
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card bg={cardBg} shadow="xl" overflow="hidden" borderRadius="xl" height="100%">
                    <CardBody p={0}>
                      <Box 
                        height="300px" 
                        bg="gray.100" 
                        overflow="hidden"
                        position="relative"
                      >
                        {/* Google Maps iframe */}
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30776.456418907593!2d73.82173436977537!3d15.491999999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfc0b6e53596a7%3A0x887c2cb8b6e5c3b0!2sAltinho%2C%20Panaji%2C%20Goa!5e0!3m2!1sen!2sin!4v1691415269543!5m2!1sen!2sin"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="InfoTech Goa Location"
                        ></iframe>
                        
                        {/* Map overlay with info */}
                        <Box
                          position="absolute"
                          bottom={0}
                          left={0}
                          right={0}
                          bg="blackAlpha.700"
                          color="white"
                          p={3}
                        >
                          <Text fontSize="sm" fontWeight="medium">
                            Info Tech Corporation Of Goa Ltd. Location
                          </Text>
                        </Box>
                      </Box>
                      <Box p={6}>
                        <Heading as="h3" size="md" mb={4} color={headingColor}>
                          Info Tech Corporation Of Goa Ltd.
                        </Heading>
                        <Text color="gray.600" mb={2}>
                          3rd Floor, IT Hub, Altinho, Panaji, Goa 403001
                        </Text>
                        <HStack mb={4}>
                          <Text color="yellow.500">★★★★★</Text>
                          <Text color="gray.500">4.5 (26 reviews)</Text>
                        </HStack>
                        <Button 
                          colorScheme="blue" 
                          size="sm" 
                          variant="outline"
                          as="a"
                          href="https://maps.google.com/?q=Infotech+Corporation+of+Goa+Ltd,+Altinho,+Panaji,+Goa"
                          target="_blank"
                          rel="noopener noreferrer"
                          leftIcon={<FaMapMarkerAlt />}
                        >
                          Open in Google Maps
                        </Button>
                      </Box>
                    </CardBody>
                  </Card>
                </MotionBox>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Flex>
  );
}

// Purpose Card Component
const PurposeCard = ({ icon, title, description, color }) => (
  <MotionCard 
    bg="white"
    shadow="lg" 
    _hover={{ shadow: "xl" }}
    transition="all 0.3s"
    height="100%"
    textAlign="center"
    p={8}
    borderTop="4px"
    borderTopColor={`${color}.400`}
    whileHover={{ y: -5 }}
  >
    <CardBody>
      <MotionBox
        display="inline-block"
        animation={`${float} 3s ease-in-out infinite`}
      >
        <Icon as={icon} boxSize={10} color={`${color}.500`} mb={4} />
      </MotionBox>
      <Heading as="h3" size="lg" mb={4} color="purple.800">
        {title}
      </Heading>
      <Text color="gray.600">
        {description}
      </Text>
    </CardBody>
  </MotionCard>
);

// Director Card Component
const DirectorCard = ({ name, position, address }) => (
  <MotionCard 
    bg="white"
    shadow="md" 
    _hover={{ shadow: "lg" }}
    transition="all 0.3s"
    height="100%"
    p={5}
    whileHover={{ y: -3 }}
  >
    <CardBody textAlign="center">
      <Box
        width="80px"
        height="80px"
        borderRadius="full"
        bg="purple.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        margin="0 auto 16px"
      >
        <Icon as={FaUserTie} boxSize={8} color="purple.500" />
      </Box>
      <Heading as="h3" size="md" mb={2} color="purple.800">
        {name}
      </Heading>
      <Text color="blue.600" fontWeight="medium" mb={3}>
        {position}
      </Text>
      {address && (
        <Text color="gray.600" fontSize="sm">
          {address}
        </Text>
      )}
    </CardBody>
  </MotionCard>
);

// Contact Item Component
const ContactItem = ({ icon, title, content }) => (
  <HStack align="start" spacing={4}>
    <MotionBox
      animation={`${pulse} 2s ease-in-out infinite`}
    >
      <Icon as={icon} boxSize={5} color="blue.500" mt={1} />
    </MotionBox>
    <Box>
      <Text fontWeight="bold" color="purple.800" mb={1}>
        {title}
      </Text>
      {typeof content === 'string' ? (
        <Text color="gray.600">{content}</Text>
      ) : (
        content
      )}
    </Box>
  </HStack>
);

// Stat Card Component
const StatCard = ({ number, label, icon, color, delay }) => (
  <MotionCard
    bg="white"
    shadow="md"
    textAlign="center"
    p={6}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, shadow: "lg" }}
  >
    <CardBody>
      <Icon as={icon} boxSize={8} color={`${color}.500`} mb={4} />
      <Heading as="h3" size="xl" color={`${color}.700`} mb={2}>
        {number}
      </Heading>
      <Text color="gray.600" fontSize="md" fontWeight="medium">
        {label}
      </Text>
    </CardBody>
  </MotionCard>
);

// Value Card Component
const ValueCard = ({ icon, title, description, color }) => (
  <MotionCard
    bg="white"
    shadow="md"
    p={6}
    height="100%"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, shadow: "lg" }}
    borderLeft="4px solid"
    borderLeftColor={`${color}.400`}
  >
    <CardBody textAlign="center">
      <Icon as={icon} boxSize={8} color={`${color}.500`} mb={4} />
      <Heading as="h3" size="md" mb={3} color="purple.800">
        {title}
      </Heading>
      <Text color="gray.600" fontSize="md">
        {description}
      </Text>
    </CardBody>
  </MotionCard>
);