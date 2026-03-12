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
  List,
  ListItem,
  ListIcon,
  Badge,
  Divider,
  Button,
  keyframes,
  Link
} from "@chakra-ui/react";
import {
  FaLaptopCode,
  FaDatabase,
  FaShieldAlt,
  FaMobileAlt,
  FaCloud,
  FaUsers,
  FaServer,
  FaNetworkWired,
  FaDesktop,
  FaGraduationCap,
  FaCalendarAlt,
  FaUserTie,
  FaHandshake,
  FaCheckCircle,
  FaArrowRight,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { FaArrowRightToBracket } from "react-icons/fa6";
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
const MotionHStack = motion(HStack);

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

const gradientBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function Home() {
  // Disable browser navigation buttons
  useEffect(() => {
    // Disable back button
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function() {
      window.history.go(1);
    };
    
    // Disable refresh
    const disableRefresh = (e) => {
      // Prevent F5 and Ctrl+R
      if ((e.which || e.keyCode) === 116 || (e.ctrlKey && (e.which || e.keyCode) === 82)) {
        e.preventDefault();
      }
    };
    
    document.addEventListener("keydown", disableRefresh);
    
    return () => {
      document.removeEventListener("keydown", disableRefresh);
    };
  }, []);

  // Vibrant color scheme
  const headingColor = useColorModeValue("purple.800", "purple.300");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const accentColor = useColorModeValue("pink.500", "pink.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const internshipBg = useColorModeValue("blue.50", "blue.900");

  return (
    <Flex direction="column" minH="100vh" fontFamily="'Segoe UI', sans-serif">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <Box flex="1" bg="white" fontFamily="'Segoe UI', sans-serif">
{/* Hero Section */}
<Box
  position="relative"
  overflow="hidden"
  fontFamily="'Segoe UI', sans-serif"
  bgGradient="linear(to-br, blue.50, purple.50)"
  minH="80vh"
  display="flex"
  alignItems="center"
  py={8}
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
      animation: `${pulse} 8s ease-in-out infinite`,
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
      animation: `${pulse} 6s ease-in-out infinite reverse`,
    }}
  />
  
  <Container maxW="7xl" position="relative" zIndex={1} fontFamily="'Segoe UI', sans-serif">
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
      <MotionVStack
        spacing={6}
        align="start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        fontFamily="'Segoe UI', sans-serif"
      >
        {/* Badge */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          fontFamily="'Segoe UI', sans-serif"
        >
          <Badge 
            colorScheme="blue" 
            fontSize="md" 
            p={2} 
            borderRadius="md"
            boxShadow="md"
            fontFamily="'Segoe UI', sans-serif"
          >
            Government of Goa Undertaking
          </Badge>
        </MotionBox>

        {/* Main Heading */}
        <MotionHeading
          as="h1"
          size={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          lineHeight="shorter"
          color="blue.900"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          fontFamily="'Segoe UI', sans-serif"
        >
          Empowering Digital <Box as="span" color="purple.600">Goa</Box>
        </MotionHeading>

        {/* Subheading */}
        <MotionText
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="medium"
          color="blue.800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          fontFamily="'Segoe UI', sans-serif"
        >
          Info Tech Corporation of Goa - Driving Digital Transformation
        </MotionText>

        {/* Description */}
        <MotionText
          fontSize={{ base: "md", md: "lg" }}
          color="blue.700"
          maxW="lg"
          lineHeight="tall"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          fontFamily="'Segoe UI', sans-serif"
        >
          We specialize in e-Governance, IT infrastructure, and innovative digital solutions 
          to empower citizens and transform government services across Goa.
        </MotionText>

        {/* CTA Buttons */}
        <MotionHStack
          spacing={4}
          mt={4}
          flexWrap="wrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          fontFamily="'Segoe UI', sans-serif"
        >
          <Button 
            colorScheme="blue" 
            size="lg" 
            rightIcon={<FaArrowRight />}
            boxShadow="md"
            onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
            mb={{ base: 2, md: 0 }}
            fontFamily="'Segoe UI', sans-serif"
          >
            Explore Our Services
          </Button>
          
          {/* Enhanced Official Website Button */}
          <MotionBox
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button 
              colorScheme="purple" 
              size="lg"
              position="relative"
              overflow="hidden"
              rightIcon={
                <MotionBox
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <FaExternalLinkAlt />
                </MotionBox>
              }
              bgGradient="linear(to-r, purple.500, blue.500)"
              color="white"
              _hover={{
                bgGradient: "linear(to-r, purple.600, blue.600)",
                transform: "translateY(-2px)",
                boxShadow: "xl",
                _before: { opacity: 1 }
              }}
              _before={{
                content: '""',
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)",
                transform: "rotate(45deg)",
                transition: "all 0.5s ease",
                opacity: 0
              }}
              sx={{
                "&:hover:before": {
                  animation: "shine 1.5s ease forwards"
                }
              }}
              transition="all 0.3s ease"
              boxShadow="md"
            >
              <Link 
                href="https://infotech.goa.gov.in/" 
                isExternal 
                _hover={{ textDecoration: "none" }}
                fontFamily="'Segoe UI', sans-serif"
              >
                Official Website
              </Link>
            </Button>
          </MotionBox>
        </MotionHStack>

        {/* Stats */}
        <MotionHStack
          spacing={{ base: 4, md: 8 }}
          mt={8}
          flexWrap="wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          fontFamily="'Segoe UI', sans-serif"
        >
          <VStack align="start" spacing={0} mb={{ base: 2, md: 0 }} fontFamily="'Segoe UI', sans-serif">
            <Text fontSize="2xl" fontWeight="bold" color="blue.800" fontFamily="'Segoe UI', sans-serif">50+</Text>
            <Text fontSize="sm" color="blue.600" fontFamily="'Segoe UI', sans-serif">Departments Served</Text>
          </VStack>
          <VStack align="start" spacing={0} mb={{ base: 2, md: 0 }} fontFamily="'Segoe UI', sans-serif">
            <Text fontSize="2xl" fontWeight="bold" color="blue.800" fontFamily="'Segoe UI', sans-serif">100+</Text>
            <Text fontSize="sm" color="blue.600" fontFamily="'Segoe UI', sans-serif">Digital Services</Text>
          </VStack>
          <VStack align="start" spacing={0} fontFamily="'Segoe UI', sans-serif">
            <Text fontSize="2xl" fontWeight="bold" color="blue.800" fontFamily="'Segoe UI', sans-serif">24/7</Text>
            <Text fontSize="sm" color="blue.600" fontFamily="'Segoe UI', sans-serif">Support</Text>
          </VStack>
        </MotionHStack>
      </MotionVStack>

      {/* Image with floating effect - Reduced size */}
      <MotionBox
        position="relative"
        initial={{ opacity: 0, x: 20, rotate: 3 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        css={{
          animation: `${float} 6s ease-in-out infinite`,
        }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        mt={{ base: 8, md: 0 }}
        fontFamily="'Segoe UI', sans-serif"
      >
        <Box
          position="absolute"
          top="-20px"
          right="-20px"
          w="100px"
          h="100px"
          bg="blue.200"
          opacity="0.5"
          borderRadius="lg"
          transform="rotate(15deg)"
          zIndex={-1}
          css={{
            animation: `${pulse} 4s ease-in-out infinite`,
          }}
        />
        <Box
          position="absolute"
          bottom="-20px"
          left="-20px"
          w="80px"
          h="80px"
          bg="purple.200"
          opacity="0.5"
          borderRadius="lg"
          transform="rotate(-15deg)"
          zIndex={-1}
          css={{
            animation: `${pulse} 5s ease-in-out infinite reverse`,
          }}
        />
        <Image
          src="/itg.png"
          alt="Digital Transformation in Goa"
          borderRadius="2xl"
          maxW="100%"
          maxH="400px"
          objectFit="contain"
          boxShadow="2xl"
          border="8px solid"
          borderColor="white"
        />
      </MotionBox>
    </SimpleGrid>
  </Container>
</Box>
        {/* About ITG Section */}
        <Box py={16} px={{ base: 4, md: 8 }} bg="white" fontFamily="'Segoe UI', sans-serif">
          <Container maxW="6xl" fontFamily="'Segoe UI', sans-serif">
            <VStack spacing={10} fontFamily="'Segoe UI', sans-serif">
              <MotionVStack
                spacing={4}
                textAlign="center"
                maxW="3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                fontFamily="'Segoe UI', sans-serif"
              >
                <Heading as="h2" size="xl" color={headingColor} fontFamily="'Segoe UI', sans-serif">
                  About Info Tech Corporation Of Goa
                </Heading>
                <Text fontSize="lg" color={textColor} fontFamily="'Segoe UI', sans-serif">
                  ITG is a Government of Goa undertaking established to provide comprehensive 
                  IT solutions and services to various government departments and agencies.
                </Text>
              </MotionVStack>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} fontFamily="'Segoe UI', sans-serif">
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ y: -5 }}
                  fontFamily="'Segoe UI', sans-serif"
                >
                  <FeatureCard
                    icon={FaServer}
                    title="Data Center Services"
                    description="State-of-the-art data center with 24/7 monitoring and support"
                    color="purple"
                  />
                </MotionBox>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ y: -5 }}
                  fontFamily="'Segoe UI', sans-serif"
                >
                  <FeatureCard
                    icon={FaNetworkWired}
                    title="Network Infrastructure"
                    description="Robust networking solutions connecting government offices across Goa"
                    color="pink"
                  />
                </MotionBox>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ y: -5 }}
                  fontFamily="'Segoe UI', sans-serif"
                >
                  <FeatureCard
                    icon={FaDesktop}
                    title="Technical Support"
                    description="Comprehensive IT support services for government departments"
                    color="orange"
                  />
                </MotionBox>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ y: -5 }}
                  fontFamily="'Segoe UI', sans-serif"
                >
                  <FeatureCard
                    icon={FaShieldAlt}
                    title="Security Solutions"
                    description="End-to-end cybersecurity for government digital assets"
                    color="red"
                  />
                </MotionBox>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Services Section */}
        <Box id="services" py={16} px={{ base: 4, md: 8 }} bg={sectionBg} fontFamily="'Segoe UI', sans-serif">
          <Container maxW="6xl" fontFamily="'Segoe UI', sans-serif">
            <VStack spacing={12} fontFamily="'Segoe UI', sans-serif">
              <MotionVStack
                spacing={4}
                textAlign="center"
                maxW="2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                fontFamily="'Segoe UI', sans-serif"
              >
                <Heading as="h2" size="xl" color={headingColor} fontFamily="'Segoe UI', sans-serif">
                  Our Services
                </Heading>
                <Text fontSize="lg" color={textColor} fontFamily="'Segoe UI', sans-serif">
                  Comprehensive IT solutions for government departments and public services
                </Text>
              </MotionVStack>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} fontFamily="'Segoe UI', sans-serif">
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ y: -5 }}
                  fontFamily="'Segoe UI', sans-serif"
                >
                  <ServiceCard
                    icon={FaLaptopCode}
                    title="Software Development"
                    description="Custom software solutions for government departments including web applications, desktop applications, and specialized software for various departments"
                    color="purple"
                  />
                </MotionBox>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ y: -5 }}
                  fontFamily="'Segoe UI', sans-serif"
                >
                  <ServiceCard
                    icon={FaDatabase}
                    title="Database Management"
                    description="Secure data management systems for governance, including citizen databases, employee records, and administrative data"
                    color="teal"
                  />
                </MotionBox>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ y: -5 }}
                  fontFamily="'Segoe UI', sans-serif"
                >
                  <ServiceCard
                    icon={FaShieldAlt}
                    title="Cybersecurity"
                    description="Protecting government digital assets and citizen data with advanced security protocols and monitoring systems"
                    color="red"
                  />
                </MotionBox>
               <MotionBox
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.4 }}
  whileHover={{ y: -5 }}
>
  <ServiceCard
    icon={FaMobileAlt}
    title="Mobile Applications"
    description="Government services accessible through mobile platforms including citizen services, employee apps, and emergency services"
    color="blue"
  />
</MotionBox>
<MotionBox
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.5 }}
  whileHover={{ y: -5 }}
>
  <ServiceCard
    icon={FaCloud}
    title="Cloud Services"
    description="Secure cloud infrastructure for government operations with scalable storage and computing resources"
    color="orange"
  />
</MotionBox>
<MotionBox
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.6 }}
  whileHover={{ y: -5 }}
>
  <ServiceCard
    icon={FaUsers}
    title="IT Consulting"
    description="Expert guidance for digital transformation in governance, including technology roadmap planning and implementation"
    color="green"
  />
</MotionBox>
</SimpleGrid>
</VStack>
</Container>
</Box>

{/* Internship Program Section */}
<Box id="internship" py={16} px={{ base: 4, md: 8 }} bg={internshipBg}>
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
        <Badge colorScheme="blue" fontSize="lg" p={2} borderRadius="md" fontFamily="'Segoe UI', sans-serif">
          Career Development
        </Badge>
        <Heading as="h2" size="xl" color={headingColor} fontFamily="'Segoe UI', sans-serif">
          Internship Program
        </Heading>
        <Text fontSize="lg" color={textColor} fontFamily="'Segoe UI', sans-serif">
          Join our comprehensive internship program to gain hands-on experience in government IT projects
        </Text>
      </MotionVStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="start">
        <MotionVStack
          spacing={6}
          align="start"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Heading as="h3" size="lg" color={headingColor} fontFamily="'Segoe UI', sans-serif">
            Program Highlights
          </Heading>
          
          <FeatureItem 
            icon={FaGraduationCap}
            title="Learning Opportunities"
            description="Work on real government projects with mentorship from experienced professionals"
          />
          
          <FeatureItem 
            icon={FaCalendarAlt}
            title="Duration & Schedule"
            description="Flexible programs from 3 to 6 months, full-time and part-time options available"
          />
          
          <FeatureItem 
            icon={FaUserTie}
            title="Eligibility"
            description="Open to engineering and computer science students from recognized institutions"
          />
          
          <FeatureItem 
            icon={FaHandshake}
            title="Stipend & Benefits"
            description="Monthly stipend, certificate of completion, and potential job opportunities"
          />
        </MotionVStack>
        
        <MotionBox
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card bg={cardBg} shadow="xl" overflow="hidden" borderRadius="xl">
            <CardBody p={0}>
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Internship Program"
                height="250px"
                width="100%"
                objectFit="cover"
              />
              <Box p={6}>
                <Heading as="h3" size="md" mb={4} color={headingColor} fontFamily="'Segoe UI', sans-serif">
                  Available Domains
                </Heading>
                <SimpleGrid columns={2} spacing={3}>
                  <HStack><Icon as={FaCheckCircle} color="green.500" /><Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">Web Development</Text></HStack>
                  <HStack><Icon as={FaCheckCircle} color="green.500" /><Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">Mobile App Development</Text></HStack>
                  <HStack><Icon as={FaCheckCircle} color="green.500" /><Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">Data Analytics</Text></HStack>
                  <HStack><Icon as={FaCheckCircle} color="green.500" /><Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">Cybersecurity</Text></HStack>
                  <HStack><Icon as={FaCheckCircle} color="green.500" /><Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">Cloud Computing</Text></HStack>
                  <HStack><Icon as={FaCheckCircle} color="green.500" /><Text fontSize="sm" fontFamily="'Segoe UI', sans-serif">UI/UX Design</Text></HStack>
                </SimpleGrid>
              </Box>
            </CardBody>
          </Card>
        </MotionBox>
      </SimpleGrid>

      {/* Testimonials */}
      <Box pt={10} width="100%">
        <Heading as="h3" size="lg" textAlign="center" mb={8} color={headingColor} fontFamily="'Segoe UI', sans-serif">
          What Our Interns Say
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <TestimonialCard
              name="Priya Sharma"
              role="Computer Engineering Student"
              text="My internship at ITG gave me invaluable experience working on real government projects. The mentorship was exceptional."
            />
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <TestimonialCard
              name="Rahul Desai"
              role="IT Student"
              text="The exposure to large-scale systems and the opportunity to contribute to digital governance was transformative for my career."
            />
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <TestimonialCard
              name="Sneha Naik"
              role="Data Science Student"
              text="I appreciated the supportive environment and the chance to apply my academic knowledge to solve real-world problems."
            />
          </MotionBox>
        </SimpleGrid>
      </Box>
    </VStack>
  </Container>
</Box>

{/* Key Projects Section */}
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
        <Heading as="h2" size="xl" color={headingColor} fontFamily="'Segoe UI', sans-serif">
          Key Projects & Initiatives
        </Heading>
        <Text fontSize="lg" color={textColor} fontFamily="'Segoe UI', sans-serif">
          Major digital initiatives transforming governance in Goa
        </Text>
      </MotionVStack>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <MotionBox
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -5 }}
        >
          <ProjectCard
            title="Goa Online Portal"
            description="A unified portal providing access to all government services and information for citizens"
            features={[
              "Single sign-on for all services",
              "Online application tracking",
              "Digital payment integration",
              "Grievance redressal system"
            ]}
            imageUrl="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
          />
        </MotionBox>
        <MotionBox
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ y: -5 }}
        >
          <ProjectCard
            title="e-Office Implementation"
            description="Digital office solution for paperless operations across government departments"
            features={[
              "Electronic file management",
              "Digital signatures",
              "Workflow automation",
              "Mobile access for officials"
            ]}
            imageUrl="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
          />
        </MotionBox>
      </SimpleGrid>
    </VStack>
  </Container>
</Box>

{/* Infrastructure Section */}
<Box py={16} px={{ base: 4, md: 8 }} bg={sectionBg}>
  <Container maxW="6xl">
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
      <MotionBox
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale: 1.02 }}
      >
        <Image
          src="/code.jpg"
          alt="IT Infrastructure"
          borderRadius="lg"
          width="100%"
          height="350px"
          objectFit="cover"
          boxShadow="xl"
        />
      </MotionBox>
      <MotionVStack
        spacing={6}
        align="start"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Heading as="h2" size="xl" color={headingColor} fontFamily="'Segoe UI', sans-serif">
          State-of-the-Art Infrastructure
        </Heading>
        <Text fontSize="lg" color={textColor} fontFamily="'Segoe UI', sans-serif">
          ITG maintains robust IT infrastructure to support Goa&#39;s digital governance initiatives
        </Text>
        <List spacing={3}>
          <ListItem fontFamily="'Segoe UI', sans-serif">
            <ListIcon as={FaCheckCircle} color="green.500" />
            Tier-3 Data Center with 99.982% availability
          </ListItem>
          <ListItem fontFamily="'Segoe UI', sans-serif">
            <ListIcon as={FaCheckCircle} color="green.500" />
            State-wide network connecting all government offices
          </ListItem>
          <ListItem fontFamily="'Segoe UI', sans-serif">
            <ListIcon as={FaCheckCircle} color="green.500" />
            24/7 monitoring and support services
          </ListItem>
          <ListItem fontFamily="'Segoe UI', sans-serif">
            <ListIcon as={FaCheckCircle} color="green.500" />
            Disaster recovery and business continuity solutions
          </ListItem>
          <ListItem fontFamily="'Segoe UI', sans-serif">
            <ListIcon as={FaCheckCircle} color="green.500" />
            Secure cloud infrastructure for scalable operations
          </ListItem>
        </List>
      </MotionVStack>
    </SimpleGrid>
  </Container>
</Box>

{/* Achievements Section */}
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
        <Heading as="h2" size="xl" color={headingColor} fontFamily="'Segoe UI', sans-serif">
          Our Achievements
        </Heading>
        <Text fontSize="lg" color={textColor} fontFamily="'Segoe UI', sans-serif">
          Milestones in digital transformation of Goa&#39;s governance
        </Text>
      </MotionVStack>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <AchievementCard
            number="100+"
            title="Digital Services"
            description="Government services transformed to digital platforms"
          />
        </MotionBox>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <AchievementCard
            number="50+"
            title="Departments"
            description="Government departments using our IT solutions"
          />
        </MotionBox>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
        >
          <AchievementCard
            number="10M+"
            title="Transactions"
            description="Digital transactions processed annually"
          />
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
// Service Card Component
const ServiceCard = ({ icon, title, description, color }) => (
<MotionCard 
  bg="white"
  shadow="lg" 
  _hover={{ shadow: "xl" }}
  transition="all 0.3s"
  height="100%"
  borderTop="4px"
  borderTopColor={`${color}.400`}
  whileHover={{ y: -5 }}
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
>
  <CardBody textAlign="center" p={6}>
    <Icon as={icon} boxSize={10} color={`${color}.500`} mb={4} />
    <Heading as="h3" size="md" mb={3} color="purple.800" fontFamily="'Segoe UI', sans-serif">
      {title}
    </Heading>
    <Text color="gray.600" fontSize="md" fontFamily="'Segoe UI', sans-serif">
      {description}
    </Text>
  </CardBody>
</MotionCard>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, color }) => (
<MotionCard 
  bg="white"
  shadow="lg" 
  _hover={{ shadow: "xl" }}
  transition="all 0.2s"
  height="100%"
  textAlign="center"
  p={5}
  borderTop="4px"
  borderTopColor={`${color}.400`}
  whileHover={{ y: -5 }}
>
  <CardBody>
    <Icon as={icon} boxSize={8} color={`${color}.500`} mb={3} />
    <Heading as="h3" size="sm" mb={2} color="purple.800" fontFamily="'Segoe UI', sans-serif">
      {title}
    </Heading>
    <Text color="gray.600" fontSize="md" fontFamily="'Segoe UI', sans-serif">
      {description}
    </Text>
  </CardBody>
</MotionCard>
);

// Project Card Component
const ProjectCard = ({ title, description, features, imageUrl }) => (
<MotionCard 
  overflow="hidden"
  shadow="xl"
  _hover={{ shadow: "2xl" }}
  transition="all 0.3s"
  height="100%"
  whileHover={{ y: -5 }}
>
  <Image
    src={imageUrl}
    alt={title}
    height="200px"
    objectFit="cover"
  />
  <CardBody>
    <Heading as="h3" size="md" mb={3} color="purple.800" fontFamily="'Segoe UI', sans-serif">
      {title}
    </Heading>
    <Text color="gray.600" mb={4} fontFamily="'Segoe UI', sans-serif">
      {description}
    </Text>
    <List spacing={2}>
      {features.map((feature, index) => (
        <ListItem key={index} fontSize="md" fontFamily="'Segoe UI', sans-serif">
          <ListIcon as={FaCheckCircle} color="green.500" />
          {feature}
        </ListItem>
      ))}
    </List>
  </CardBody>
</MotionCard>
);

// Achievement Card Component
const AchievementCard = ({ number, title, description }) => {
  const cardBg = useColorModeValue("purple.50", "purple.900");
  const numberColor = useColorModeValue("purple.600", "purple.300");
  const titleColor = useColorModeValue("purple.800", "purple.200");
  
  return (
    <MotionVStack 
      textAlign="center" 
      spacing={3} 
      p={6} 
      bg={cardBg} 
      borderRadius="xl" 
      height="100%"
      whileHover={{ scale: 1.05 }}
    >
      <Heading as="h3" size="2xl" color={numberColor} fontFamily="'Segoe UI', sans-serif">
        {number}
      </Heading>
      <Heading as="h4" size="sm" color={titleColor} fontFamily="'Segoe UI', sans-serif">
        {title}
      </Heading>
      <Text color="gray.600" fontSize="md" fontFamily="'Segoe UI', sans-serif">
        {description}
      </Text>
    </MotionVStack>
  );
}

// Feature Item Component for Internship Section
const FeatureItem = ({ icon, title, description }) => (
  <HStack align="start" spacing={4}>
    <Icon as={icon} boxSize={6} color="purple.500" mt={1} />
    <Box>
      <Heading as="h4" size="sm" mb={1} color="purple.800" fontFamily="'Segoe UI', sans-serif">
        {title}
      </Heading>
      <Text color="gray.600" fontSize="md" fontFamily="'Segoe UI', sans-serif">
        {description}
      </Text>
    </Box>
  </HStack>
);

// Testimonial Card Component
const TestimonialCard = ({ name, role, text }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  
  return (
    <MotionCard 
      bg={cardBg} 
      shadow="lg" 
      height="100%"
      whileHover={{ y: -5 }}
    >
      <CardBody>
        <VStack align="start" spacing={4}>
          <Text color="gray.600" fontStyle="italic" fontFamily="'Segoe UI', sans-serif">
            &quot;{text}&quot;
          </Text>
          <Divider />
          <Box>
            <Text fontWeight="bold" color="purple.800" fontFamily="'Segoe UI', sans-serif">{name}</Text>
            <Text fontSize="md" color="gray.500" fontFamily="'Segoe UI', sans-serif">{role}</Text>
          </Box>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};