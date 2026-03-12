// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import {
//   Box,
//   Container,
//   Heading,
//   Text,
//   VStack,
//   HStack,
//   Avatar,
//   Card,
//   CardBody,
//   Divider,
//   Skeleton,
//   SkeletonCircle,
//   SkeletonText,
//   useToast,
//   Badge,
//   Flex,
//   Icon,
//   Button,
//   Center,
//   SimpleGrid,
//   useColorModeValue,
//   keyframes,
//   Alert,
//   AlertIcon,
//   AlertTitle,
//   AlertDescription,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
//   FormControl,
//   FormLabel,
//   Textarea,
//   Input,
//   Spinner,
//   Tabs,
//   TabList,
//   TabPanels,
//   Tab,
//   TabPanel,
//   Image,
//   IconButton,
//   Progress,
//   Wrap,
//   WrapItem
// } from '@chakra-ui/react';
// import {
//   FiMail,
//   FiPhone,
//   FiBriefcase,
//   FiAward,
//   FiUser,
//   FiArrowLeft,
//   FiStar,
//   FiSend,
//   FiX,
//   FiLinkedin,
//   FiGlobe,
//   FiMessageSquare,
//   FiInbox,
//   FiPaperclip,
//   FiCalendar,
//   FiTarget,
//   FiBookOpen,
//   FiCheckCircle,
//   FiCode,
//   FiCpu,
//   FiDatabase,
//   FiLayers,
//   FiCloud,
//   FiShield,
//   FiTrash2
// } from 'react-icons/fi';
// import { FaUserTie, FaRocket, FaLightbulb, FaHandshake, FaGraduationCap } from 'react-icons/fa';
// import { motion } from 'framer-motion';

// // Animation components
// const MotionBox = motion(Box);
// const MotionCard = motion(Card);

// // Keyframes for animations
// const pulse = keyframes`
//   0% { transform: scale(1); }
//   50% { transform: scale(1.05); }
//   100% { transform: scale(1); }
// `;

// const float = keyframes`
//   0% { transform: translateY(0px); }
//   50% { transform: translateY(-8px); }
//   100% { transform: translateY(0px); }
// `;

// const shimmer = keyframes`
//   0% { background-position: -1000px 0; }
//   100% { background-position: 1000px 0; }
// `;

// // Expertise icons mapping
// const expertiseIcons = {
//   'software development': FiCode,
//   'web development': FiLayers,
//   'mobile development': FiCpu,
//   'cloud computing': FiCloud,
//   'database': FiDatabase,
//   'cybersecurity': FiShield,
//   'ai/ml': FiCpu,
//   'devops': FiCode,
//   'frontend': FiLayers,
//   'backend': FiDatabase,
//   'fullstack': FiCode
// };

// export default function MentorDetails() {
//   const [mentorData, setMentorData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [emailContent, setEmailContent] = useState('');
//   const [emailSubject, setEmailSubject] = useState('');
//   const [sendingEmail, setSendingEmail] = useState(false);
//   const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);
//   const [noMentorAssigned, setNoMentorAssigned] = useState(false);
//   const router = useRouter();
//   const toast = useToast();

//   // Color values matching the dashboard
//   const cardBg = useColorModeValue("white", "gray.800");
//   const subtleBg = useColorModeValue("gray.50", "gray.700");
//   const primaryColor = useColorModeValue("blue.500", "blue.300");
//   const accentColor = useColorModeValue("purple.500", "purple.300");
//   const textColor = useColorModeValue("gray.700", "gray.200");
//   const mentorGradient = useColorModeValue("linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)");
//   const blue50 = useColorModeValue("blue.50", "blue.900");
//   const green50 = useColorModeValue("green.50", "green.900");
//   const purple50 = useColorModeValue("purple.50", "purple.900");
//   const orange50 = useColorModeValue("orange.50", "orange.900");
//   const gray50 = useColorModeValue("gray.50", "gray.700");
//   const gray100 = useColorModeValue("gray.100", "gray.700");
//   const highlightBg = useColorModeValue("blue.50", "blue.900");
//   const highlightBorder = useColorModeValue("blue.200", "blue.600");

//   useEffect(() => {
//     // Set minimum load time timer
//     const minimumLoadTimer = setTimeout(() => {
//       setMinimumLoadTimePassed(true);
//     }, 2000);

//     const fetchMentorData = async () => {
//       const startTime = Date.now();
      
//       try {
//         setLoading(true);
//         setError(null);
//         setNoMentorAssigned(false);
        
//         // Get user ID from localStorage
//         const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        
//         if (!userData) {
//           throw new Error("No user data found. Please log in again.");
//         }
        
//         const user = JSON.parse(userData);
//         const userId = user?.userId || user?.user_id;
        
//         if (!userId) {
//           throw new Error("User ID not found in user data");
//         }
        
//         // Fetch mentor details using the new API
//         const response = await fetch(`/api/mentor-detail?userId=${userId}`);
        
//         if (!response.ok) {
//           const errorData = await response.json();
          
//           // Check if the error is specifically about no mentor assigned
//           if (errorData.message && 
//               (errorData.message.toLowerCase().includes("not assigned") || 
//                errorData.message.toLowerCase().includes("no mentor"))) {
//             setNoMentorAssigned(true);
//             setMentorData(null);
//             return;
//           } else {
//             throw new Error(errorData.error || 'Failed to fetch mentor data');
//           }
//         } else {
//           const data = await response.json();
          
//           // Check if the response indicates no mentor assigned
//           if (data.message && data.message.toLowerCase().includes("not assigned")) {
//             setNoMentorAssigned(true);
//             setMentorData(null);
//           } else {
//             setMentorData(data);
//             setNoMentorAssigned(false);
//           }
//         }
        
//         // Set empty subject and content
//         setEmailSubject('');
//         setEmailContent('');
//       } catch (err) {
//         console.error('Error fetching mentor:', err);
//         // Only set error if it's not a "no mentor assigned" case
//         if (!err.message.toLowerCase().includes("not assigned") && 
//             !err.message.toLowerCase().includes("no mentor") &&
//             !err.message.toLowerCase().includes("not found")) {
//           setError(err.message);
//           toast({
//             title: 'Error',
//             description: err.message,
//             status: 'error',
//             duration: 5000,
//             isClosable: true,
//           });
//         } else {
//           setNoMentorAssigned(true);
//         }
//       } finally {
//         // Wait for minimum load time before hiding spinner
//         if (minimumLoadTimePassed) {
//           setLoading(false);
//         } else {
//           // If minimum time hasn't passed yet, wait for it
//           setTimeout(() => {
//             setLoading(false);
//           }, 2000 - (Date.now() - startTime));
//         }
//       }
//     };

//     fetchMentorData();

//     return () => clearTimeout(minimumLoadTimer);
//   }, [toast, minimumLoadTimePassed]);

//   // Function to open email client with pre-filled content
//   const openEmailClient = () => {
//     if (!mentorData || !mentorData.mentor_email) {
//       toast({
//         title: "No mentor assigned",
//         description: "You don't have a mentor assigned yet to send an email.",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     if (!emailContent.trim()) {
//       toast({
//         title: "Message required",
//         description: "Please write a message before sending.",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     const subject = encodeURIComponent(emailSubject || "Message from Mentee");
//     const body = encodeURIComponent(emailContent);
//     window.location.href = `mailto:${mentorData.mentor_email}?subject=${subject}&body=${body}`;
    
//     // Clear form
//     setEmailSubject('');
//     setEmailContent('');
    
//     toast({
//       title: "Email client opened!",
//       description: "Your message has been copied to your email client.",
//       status: "success",
//       duration: 3000,
//       isClosable: true,
//     });
//   };

//   // Function to clear the email form
//   const clearEmailForm = () => {
//     setEmailSubject('');
//     setEmailContent('');
//     toast({
//       title: "Form cleared",
//       description: "The email form has been cleared.",
//       status: "info",
//       duration: 2000,
//       isClosable: true,
//     });
//   };

//   // Function to get icon for expertise
//   const getExpertiseIcon = (expertise) => {
//     const lowerExpertise = expertise.toLowerCase().trim();
//     for (const [key, icon] of Object.entries(expertiseIcons)) {
//       if (lowerExpertise.includes(key)) {
//         return icon;
//       }
//     }
//     return FiCode; // Default icon
//   };

//   if (loading) {
//     return (
//       <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
//         <VStack spacing={6}>
//           <Box 
//             p={6} 
//             borderRadius="xl" 
//             bgGradient="linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)"
//             color="white"
//             boxShadow="xl"
//             animation={`${pulse} 2s infinite`}
//           >
//             <Icon as={FaUserTie} boxSize={10} />
//           </Box>
//           <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
//           <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">Finding your perfect mentor...</Text>
//           <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
//         </VStack>
//       </Box>
//     );
//   }
 
//   if (noMentorAssigned) {
//   return (
//     <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={10} px={6} position="relative" overflow="hidden">
//       {/* Background elements */}
//       <Box
//         position="absolute"
//         top="10%"
//         right="10%"
//         w="200px"
//         h="200px"
//         borderRadius="full"
//         bg="blue.100"
//         opacity="0.2"
//         zIndex="0"
//         animation={`${float} 8s ease-in-out infinite`}
//       />
//       <Box
//         position="absolute"
//         bottom="10%"
//         left="10%"
//         w="150px"
//         h="150px"
//         borderRadius="full"
//         bg="purple.100"
//         opacity="0.2"
//         zIndex="0"
//         animation={`${float} 10s ease-in-out infinite`}
//       />
      
//       <Box position="relative" zIndex="1">
//         {/* Removed the Back to Dashboard button from this section */}
//         <Center>
//           <MotionBox
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <VStack spacing={4} textAlign="center" p={8} bg={cardBg} borderRadius="xl" boxShadow="xl">
//               <Box 
//                 p={4} 
//                 borderRadius="full" 
//                 bg="blue.100"
//                 color="blue.500"
//                 animation={`${pulse} 2s infinite`}
//               >
//                 <Icon as={FaUserTie} boxSize={10} />
//               </Box>
//               <Heading size="lg" color="blue.500" fontFamily="'Segoe UI', sans-serif">Mentor Details</Heading>
//               <Text fontFamily="'Segoe UI', sans-serif" color={textColor}>
//                 No mentor has been assigned to you yet.
//               </Text>
//               <Text fontSize="sm" color="gray.500">
//                 Our team is working to match you with the perfect mentor. Please check back soon!
//               </Text>
//               <Button 
//                 colorScheme="blue" 
//                 onClick={() => router.push("/student/dashboard")}
//                 mt={4}
//                 fontFamily="'Segoe UI', sans-serif"
//                 rightIcon={<FaRocket />}
//               >
//                 Back to Dashboard
//               </Button>
//             </VStack>
//           </MotionBox>
//         </Center>
//       </Box>
//     </Box>
//   );
// }

//   if (error || !mentorData) {
//     return (
//       <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={10} px={6} position="relative" overflow="hidden">
//         {/* Background elements */}
//         <Box
//           position="absolute"
//           top="10%"
//           right="10%"
//           w="200px"
//           h="200px"
//           borderRadius="full"
//           bg="blue.100"
//           opacity="0.2"
//           zIndex="0"
//           animation={`${float} 8s ease-in-out infinite`}
//         />
//         <Box
//           position="absolute"
//           bottom="10%"
//           left="10%"
//           w="150px"
//           h="150px"
//           borderRadius="full"
//           bg="purple.100"
//           opacity="0.2"
//           zIndex="0"
//           animation={`${float} 10s ease-in-out infinite`}
//         />
        
//         <Box position="relative" zIndex="1">
//           <Button 
//             mb={6} 
//             colorScheme="blue" 
//             variant="outline" 
//             onClick={() => router.push("/student/dashboard")}
//             leftIcon={<FiArrowLeft />}
//             fontFamily="'Segoe UI', sans-serif"
//             _hover={{ transform: "translateX(-3px)", shadow: "md" }}
//             transition="all 0.2s ease"
//           >
//             Back to Dashboard
//           </Button>
//           <Center>
//             <MotionBox
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.5 }}
//             >
//               <VStack spacing={4} textAlign="center" p={8} bg={cardBg} borderRadius="xl" boxShadow="xl">
//                 <Box 
//                   p={4} 
//                   borderRadius="full" 
//                   bg="red.100"
//                   color="red.500"
//                   animation={`${pulse} 2s infinite`}
//                 >
//                   <Icon as={FiX} boxSize={10} />
//                 </Box>
//                 <Heading size="lg" color="red.500" fontFamily="'Segoe UI', sans-serif">Error Loading Mentor</Heading>
//                 <Text fontFamily="'Segoe UI', sans-serif" color={textColor}>
//                   {error || "There was an error loading your mentor information."}
//                 </Text>
//                 <Button 
//                   colorScheme="blue" 
//                   onClick={() => window.location.reload()}
//                   mt={4}
//                   fontFamily="'Segoe UI', sans-serif"
//                 >
//                   Try Again
//                 </Button>
//               </VStack>
//             </MotionBox>
//           </Center>
//         </Box>
//       </Box>
//     );
//   }

//   return (
//     <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" position="relative" overflow="hidden">
//       {/* Animated background elements */}
//       <Box
//         position="absolute"
//         top="-100px"
//         right="-100px"
//         w="300px"
//         h="300px"
//         borderRadius="full"
//         bg="blue.50"
//         opacity="0.3"
//         zIndex="0"
//         animation={`${float} 6s ease-in-out infinite`}
//       />
//       <Box
//         position="absolute"
//         bottom="-80px"
//         left="-80px"
//         w="200px"
//         h="200px"
//         borderRadius="full"
//         bg="purple.50"
//         opacity="0.3"
//         zIndex="0"
//         animation={`${float} 7s ease-in-out infinite`}
//       />
      
//       {/* Geometric shapes */}
//       <Box
//         position="absolute"
//         top="20%"
//         left="5%"
//         w="100px"
//         h="100px"
//         border="2px solid"
//         borderColor="blue.200"
//         opacity="0.2"
//         transform="rotate(45deg)"
//         zIndex="0"
//       />
//       <Box
//         position="absolute"
//         bottom="20%"
//         right="5%"
//         w="80px"
//         h="80px"
//         border="2px solid"
//         borderColor="purple.200"
//         opacity="0.2"
//         transform="rotate(20deg)"
//         zIndex="0"
//       />
      
//       <Box position="relative" zIndex="1" py={8} px={4}>
//         <Container maxW="6xl">
//           {/* Header Section */}
//           <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
//             <Button 
//               colorScheme="blue" 
//               variant="outline" 
//               onClick={() => router.push("/student/dashboard")}
//               leftIcon={<FiArrowLeft />}
//               fontFamily="'Segoe UI', sans-serif"
//               borderRadius="lg"
//               borderWidth="2px"
//               _hover={{ 
//                 bg: "blue.50",
//                 boxShadow: "md"
//               }}
//               transition="all 0.3s"
//             >
//               Back to Dashboard
//             </Button>
            
//             <Badge 
//               colorScheme="green" 
//               p={3} 
//               borderRadius="lg" 
//               fontSize="md" 
//               boxShadow="md"
//               fontFamily="'Segoe UI', sans-serif"
//             >
//               <HStack>
//                 <FiStar />
//                 <Text>Mentor Assigned</Text>
//               </HStack>
//             </Badge>
//           </Flex>

//           {/* Main Content */}
//           <VStack spacing={8} align="stretch">
//             {/* Animated Header Card */}
//             <MotionBox
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4 }}
//               maxW="2xl"
//               mx="auto"
//               w="full"
//             >
//               <MotionCard
//                 bgGradient={mentorGradient}
//                 color="white"
//                 borderRadius="xl"
//                 boxShadow="xl"
//                 overflow="hidden"
//                 animation={`${float} 6s ease-in-out infinite`}
//                 position="relative"
//                 _before={{
//                   content: '""',
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   bottom: 0,
//                   background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%)",
//                   zIndex: 0,
//                 }}
//               >
//                 <CardBody display="flex" flexDirection="column" justifyContent="center" position="relative" zIndex={1}>
//                   <VStack spacing={4} align="stretch" textAlign="center">
//                     <Box 
//                       p={3} 
//                       borderRadius="full" 
//                       bg="rgba(255,255,255,0.2)"
//                       width="max-content"
//                       mx="auto"
//                       backdropFilter="blur(10px)"
//                     >
//                       <Icon as={FaUserTie} boxSize={6} />
//                     </Box>
                    
//                     <Text fontSize="sm" opacity={0.9} fontWeight="medium">
//                       MEET YOUR MENTOR
//                     </Text>
                    
//                     <Heading size="xl" fontWeight="bold">
//                       {mentorData.mentor_name}
//                     </Heading>
                    
//                     <Text fontSize="md" opacity={0.9}>
//                       {mentorData.mentor_designation}
//                     </Text>
//                   </VStack>
//                 </CardBody>
//               </MotionCard>
//             </MotionBox>

//             {/* Success Alert */}
//             <Alert 
//               status="success" 
//               borderRadius="xl" 
//               variant="left-accent"
//               fontFamily="'Segoe UI', sans-serif"
//               boxShadow="md"
//             >
//               <AlertIcon />
//               <Box>
//                 <AlertTitle>Mentor Assigned Successfully!</AlertTitle>
//                 <AlertDescription>
//                   Your mentor has been assigned and will guide you through your internship journey.
//                 </AlertDescription>
//               </Box>
//             </Alert>

//             {/* Mentor Details Card */}
//             <MotionCard
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, delay: 0.1 }}
//               bg={cardBg}
//               borderRadius="xl"
//               boxShadow="xl"
//               overflow="hidden"
//               border="1px solid"
//               borderColor={gray100}
//               _hover={{ boxShadow: "2xl", transform: "translateY(-5px)" }}
//               sx={{ transition: "all 0.3s" }}
//             >
//               <CardBody>
//                 <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
//                   <VStack align="center" spacing={4} flexShrink={0}>
//                     <Avatar
//                       size="2xl"
//                       name={mentorData.mentor_name}
//                       src={mentorData.profile_photo}
//                       border="4px solid"
//                       borderColor={primaryColor}
//                       boxShadow="lg"
//                     />
//                     <Badge colorScheme="green" fontSize="md" p={2} borderRadius="md" boxShadow="sm">
//                       Your Mentor
//                     </Badge>
                    
//                     {/* Social Links */}
//                     <VStack spacing={3} align="center">
//                       <Text fontWeight="bold" color={textColor}>Connect</Text>
//                       <HStack spacing={3}>
//                         <Button 
//                           size="sm" 
//                           colorScheme="blue" 
//                           variant="outline" 
//                           leftIcon={<FiMail />}
//                           onClick={() => {
//                             setEmailSubject(`Introduction - ${mentorData.mentor_name}`);
//                             setEmailContent(`Dear ${mentorData.mentor_name},\n\nI'm excited to connect with you as my mentor. I'm looking forward to learning from your expertise in ${mentorData.area_of_expertise}.\n\nBest regards,\n[Your Name]`);
//                           }}
//                         >
//                           Message
//                         </Button>
//                       </HStack>
//                     </VStack>
                    
//                     {/* Expertise Tags - Simplified and more attractive */}
//                     <VStack spacing={3} align="center" width="100%">
//                       <Text fontWeight="bold" color={textColor}>Areas of Expertise</Text>
//                       <Wrap spacing={2} justify="center" width="100%">
//                         {mentorData.area_of_expertise.split(',').map((expertise, index) => {
//                           const IconComponent = getExpertiseIcon(expertise);
//                           return (
//                             <WrapItem key={index}>
//                               <Badge 
//                                 colorScheme="blue" 
//                                 variant="subtile" 
//                                 p={2} 
//                                 borderRadius="md"
//                                 display="flex"
//                                 alignItems="center"
//                                 gap={1}
//                                 bg="blue.50"
//                                 border="1px solid"
//                                 borderColor="blue.100"
//                                 boxShadow="sm"
//                               >
//                                 <Icon as={IconComponent} boxSize={3} />
//                                 <Text fontSize="xs">{expertise.trim()}</Text>
//                               </Badge>
//                             </WrapItem>
//                           );
//                         })}
//                       </Wrap>
//                     </VStack>
//                   </VStack>

//                   <VStack align="start" spacing={4} flex={1}>
//                     <Heading size="lg" color={primaryColor}>{mentorData.mentor_name}</Heading>
                    
//                     <Text fontStyle="italic" color={textColor} bg={blue50} p={3} borderRadius="md">
//                       {mentorData.bio || "Experienced mentor dedicated to helping students succeed in their internship journey."}
//                     </Text>
                    
//                     <Divider />
                    
//                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
//                       <HStack bg={gray50} p={3} borderRadius="lg">
//                         <Box p={2} borderRadius="md" bg="blue.100" color="blue.600">
//                           <Icon as={FiBriefcase} />
//                         </Box>
//                         <VStack align="start" spacing={0}>
//                           <Text fontSize="sm" color="gray.500">Designation</Text>
//                           <Text fontWeight="medium">{mentorData.mentor_designation}</Text>
//                         </VStack>
//                       </HStack>
                      
//                       <HStack bg={gray50} p={3} borderRadius="lg">
//                         <Box p={2} borderRadius="md" bg="green.100" color="green.600">
//                           <Icon as={FiAward} />
//                         </Box>
//                         <VStack align="start" spacing={0}>
//                           <Text fontSize="sm" color="gray.500">Experience</Text>
//                           <Text fontWeight="medium">{mentorData.years_of_experience} years</Text>
//                         </VStack>
//                       </HStack>
                      
//                       <HStack bg={gray50} p={3} borderRadius="lg">
//                         <Box p={2} borderRadius="md" bg="purple.100" color="purple.600">
//                           <Icon as={FiMail} />
//                         </Box>
//                         <VStack align="start" spacing={0}>
//                           <Text fontSize="sm" color="gray.500">Email</Text>
//                           <Text fontWeight="medium">{mentorData.mentor_email}</Text>
//                         </VStack>
//                       </HStack>
                      
//                       <HStack bg={gray50} p={3} borderRadius="lg">
//                         <Box p={2} borderRadius="md" bg="orange.100" color="orange.600">
//                           <Icon as={FiPhone} />
//                         </Box>
//                         <VStack align="start" spacing={0}>
//                           <Text fontSize="sm" color="gray.500">Contact</Text>
//                           <Text fontWeight="medium">{mentorData.mentor_contact}</Text>
//                         </VStack>
//                       </HStack>
//                     </SimpleGrid>
//                   </VStack>
//                 </Flex>
//               </CardBody>
//             </MotionCard>

//             {/* Email Communication Section - Simplified */}
//             <MotionCard
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, delay: 0.2 }}
//               bg={cardBg}
//               borderRadius="xl"
//               boxShadow="xl"
//               overflow="hidden"
//               border="1px solid"
//               borderColor={gray100}
//             >
//               <CardBody>
//                 <VStack spacing={4} align="stretch">
//                   <Heading size="md" color={primaryColor}>
//                     <Icon as={FiMail} mr={2} />
//                     Contact Your Mentor
//                   </Heading>
                  
//                   <Text color={textColor}>
//                     Send a message to your mentor to introduce yourself or ask questions about your internship.
//                   </Text>
                  
//                   <FormControl>
//                     <FormLabel>To</FormLabel>
//                     <Input 
//                       value={mentorData.mentor_email} 
//                       isReadOnly 
//                       bg="gray.100" 
//                       autoComplete="off"
//                     />
//                   </FormControl>

//                   <FormControl>
//                     <FormLabel>Subject</FormLabel>
//                     <Input 
//                       value={emailSubject} 
//                       onChange={(e) => setEmailSubject(e.target.value)}
//                       placeholder="Enter email subject"
//                       autoComplete="off"
//                     />
//                   </FormControl>

//                   <FormControl>
//                     <FormLabel>Your Message</FormLabel>
//                     <Textarea
//                       value={emailContent}
//                       onChange={(e) => setEmailContent(e.target.value)}
//                       placeholder="Write your message to your mentor here..."
//                       rows={8}
//                       autoComplete="off"
//                     />
//                   </FormControl>

//                   <HStack spacing={3} justify="flex-end">
//                     <Button 
//                       variant="outline" 
//                       onClick={clearEmailForm}
//                       leftIcon={<FiX />}
//                     >
//                       Clear
//                     </Button>
//                     <Button 
//                       colorScheme="blue" 
//                       onClick={openEmailClient}
//                       leftIcon={<FiMail />}
//                       isDisabled={!emailContent.trim()}
//                       fontFamily="'Segoe UI', sans-serif"
//                     >
//                       Open Email Client
//                     </Button>
//                   </HStack>
//                 </VStack>
//               </CardBody>
//             </MotionCard>

//             {/* Mentorship Guidelines Card */}
//             <MotionCard
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, delay: 0.5 }}
//               bg="blue.50"
//               borderRadius="xl"
//               border="1px solid"
//               borderColor="blue.100"
//               sx={{ transition: "all 0.3s" }}
//             >
//               <CardBody>
//                 <VStack spacing={4} align="start">
//                   <Heading size="md" color="blue.700">
//                     <Icon as={FaGraduationCap} mr={2} />
//                     Mentorship Success Guide
//                   </Heading>
                  
//                   <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
//                     <HStack align="start" spacing={3}>
//                       <Box p={2} borderRadius="md" bg="blue.100" color="blue.600" flexShrink={0}>
//                         <Icon as={FiCalendar} />
//                       </Box>
//                       <Box>
//                         <Text fontWeight="bold" color="blue.700">Schedule Regular Check-ins</Text>
//                         <Text fontSize="sm" color="blue.600">
//                           Set up consistent meeting times to discuss progress and challenges
//                         </Text>
//                       </Box>
//                     </HStack>
                    
//                     <HStack align="start" spacing={3}>
//                       <Box p={2} borderRadius="md" bg="green.100" color="green.600" flexShrink={0}>
//                         <Icon as={FiTarget} />
//                       </Box>
//                       <Box>
//                         <Text fontWeight="bold" color="blue.700">Set Clear Goals</Text>
//                         <Text fontSize="sm" color="blue.600">
//                           Define what you want to achieve with your mentor&apos;s guidance
//                         </Text>
//                       </Box>
//                     </HStack>
                    
//                     <HStack align="start" spacing={3}>
//                       <Box p={2} borderRadius="md" bg="purple.100" color="purple.600" flexShrink={0}>
//                         <Icon as={FiBookOpen} />
//                       </Box>
//                       <Box>
//                         <Text fontWeight="bold" color="blue.700">Come Prepared</Text>
//                         <Text fontSize="sm" color="blue.600">
//                           Bring specific questions and topics to make the most of your time
//                         </Text>
//                       </Box>
//                     </HStack>
                    
//                     <HStack align="start" spacing={3}>
//                       <Box p={2} borderRadius="md" bg="orange.100" color="orange.600" flexShrink={0}>
//                         <Icon as={FiCheckCircle} />
//                       </Box>
//                       <Box>
//                         <Text fontWeight="bold" color="blue.700">Implement Feedback</Text>
//                         <Text fontSize="sm" color="blue.600">
//                           Act on the advice and suggestions provided by your mentor
//                         </Text>
//                       </Box>
//                     </HStack>
//                   </SimpleGrid>
//                 </VStack>
//               </CardBody>
//             </MotionCard>
//           </VStack>
//         </Container>
//       </Box>
//     </Box>
//   );
// }


import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Card,
  CardBody,
  Divider,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useToast,
  Badge,
  Flex,
  Icon,
  Button,
  Center,
  SimpleGrid,
  useColorModeValue,
  keyframes,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  IconButton,
  Progress,
  Wrap,
  WrapItem,
  Grid,
  GridItem
} from '@chakra-ui/react';
import {
  FiMail,
  FiPhone,
  FiBriefcase,
  FiAward,
  FiUser,
  FiArrowLeft,
  FiStar,
  FiSend,
  FiX,
  FiLinkedin,
  FiGlobe,
  FiMessageSquare,
  FiInbox,
  FiPaperclip,
  FiCalendar,
  FiTarget,
  FiBookOpen,
  FiCheckCircle,
  FiCode,
  FiCpu,
  FiDatabase,
  FiLayers,
  FiCloud,
  FiShield,
  FiTrash2
} from 'react-icons/fi';
import { FaUserTie, FaRocket, FaLightbulb, FaHandshake, FaGraduationCap } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Animation components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Keyframes for animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Expertise icons mapping
const expertiseIcons = {
  'software development': FiCode,
  'web development': FiLayers,
  'mobile development': FiCpu,
  'cloud computing': FiCloud,
  'database': FiDatabase,
  'cybersecurity': FiShield,
  'ai/ml': FiCpu,
  'devops': FiCode,
  'frontend': FiLayers,
  'backend': FiDatabase,
  'fullstack': FiCode,
  'software': FiCode,
  'development': FiCode,
  'project management': FiTarget,
  'artificial intelligence': FiCpu,
  'machine learning': FiCpu
};

export default function MentorDetails() {
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);
  const [noMentorAssigned, setNoMentorAssigned] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // Color values matching the dashboard
  const cardBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const primaryColor = useColorModeValue("blue.500", "blue.300");
  const accentColor = useColorModeValue("purple.500", "purple.300");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const mentorGradient = useColorModeValue("linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)");
  const blue50 = useColorModeValue("blue.50", "blue.900");
  const green50 = useColorModeValue("green.50", "green.900");
  const purple50 = useColorModeValue("purple.50", "purple.900");
  const orange50 = useColorModeValue("orange.50", "orange.900");
  const gray50 = useColorModeValue("gray.50", "gray.700");
  const gray100 = useColorModeValue("gray.100", "gray.700");
  const highlightBg = useColorModeValue("blue.50", "blue.900");
  const highlightBorder = useColorModeValue("blue.200", "blue.600");

  useEffect(() => {
    // Set minimum load time timer
    const minimumLoadTimer = setTimeout(() => {
      setMinimumLoadTimePassed(true);
    }, 2000);

    const fetchMentorData = async () => {
      const startTime = Date.now();
      
      try {
        setLoading(true);
        setError(null);
        setNoMentorAssigned(false);
        
        // Get user ID from localStorage
        const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        
        if (!userData) {
          throw new Error("No user data found. Please log in again.");
        }
        
        const user = JSON.parse(userData);
        const userId = user?.userId || user?.user_id;
        
        if (!userId) {
          throw new Error("User ID not found in user data");
        }
        
        // Fetch mentor details using the new API
        const response = await fetch(`/api/mentor-detail?userId=${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          
          // Check if the error is specifically about no mentor assigned
          if (errorData.message && 
              (errorData.message.toLowerCase().includes("not assigned") || 
               errorData.message.toLowerCase().includes("no mentor"))) {
            setNoMentorAssigned(true);
            setMentorData(null);
            return;
          } else {
            throw new Error(errorData.error || 'Failed to fetch mentor data');
          }
        } else {
          const data = await response.json();
          
          // Check if the response indicates no mentor assigned
          if (data.message && data.message.toLowerCase().includes("not assigned")) {
            setNoMentorAssigned(true);
            setMentorData(null);
          } else {
            setMentorData(data);
            setNoMentorAssigned(false);
          }
        }
        
        // Set empty subject and content
        setEmailSubject('');
        setEmailContent('');
      } catch (err) {
        console.error('Error fetching mentor:', err);
        // Only set error if it's not a "no mentor assigned" case
        if (!err.message.toLowerCase().includes("not assigned") && 
            !err.message.toLowerCase().includes("no mentor") &&
            !err.message.toLowerCase().includes("not found")) {
          setError(err.message);
          toast({
            title: 'Error',
            description: err.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          setNoMentorAssigned(true);
        }
      } finally {
        // Wait for minimum load time before hiding spinner
        if (minimumLoadTimePassed) {
          setLoading(false);
        } else {
          // If minimum time hasn't passed yet, wait for it
          setTimeout(() => {
            setLoading(false);
          }, 2000 - (Date.now() - startTime));
        }
      }
    };

    fetchMentorData();

    return () => clearTimeout(minimumLoadTimer);
  }, [toast, minimumLoadTimePassed]);

  // Function to open email client with pre-filled content
  const openEmailClient = () => {
    if (!mentorData || !mentorData.mentor_email) {
      toast({
        title: "No mentor assigned",
        description: "You don't have a mentor assigned yet to send an email.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!emailContent.trim()) {
      toast({
        title: "Message required",
        description: "Please write a message before sending.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const subject = encodeURIComponent(emailSubject || "Message from Mentee");
    const body = encodeURIComponent(emailContent);
    window.location.href = `mailto:${mentorData.mentor_email}?subject=${subject}&body=${body}`;
    
    // Clear form
    setEmailSubject('');
    setEmailContent('');
    
    toast({
      title: "Email client opened!",
      description: "Your message has been copied to your email client.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Function to clear the email form
  const clearEmailForm = () => {
    setEmailSubject('');
    setEmailContent('');
    toast({
      title: "Form cleared",
      description: "The email form has been cleared.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Function to get icon for expertise
  const getExpertiseIcon = (expertise) => {
    const lowerExpertise = expertise.toLowerCase().trim();
    for (const [key, icon] of Object.entries(expertiseIcons)) {
      if (lowerExpertise.includes(key)) {
        return icon;
      }
    }
    return FiCode; // Default icon
  };

  if (loading) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box 
            p={6} 
            borderRadius="xl" 
            bgGradient="linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaUserTie} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">Finding your perfect mentor...</Text>
          <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
        </VStack>
      </Box>
    );
  }
 
  if (noMentorAssigned) {
  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={10} px={6} position="relative" overflow="hidden">
      {/* Background elements */}
      <Box
        position="absolute"
        top="10%"
        right="10%"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="blue.100"
        opacity="0.2"
        zIndex="0"
        animation={`${float} 8s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="10%"
        left="10%"
        w="150px"
        h="150px"
        borderRadius="full"
        bg="purple.100"
        opacity="0.2"
        zIndex="0"
        animation={`${float} 10s ease-in-out infinite`}
      />
      
      <Box position="relative" zIndex="1">
        {/* Removed the Back to Dashboard button from this section */}
        <Center>
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={4} textAlign="center" p={8} bg={cardBg} borderRadius="xl" boxShadow="xl">
              <Box 
                p={4} 
                borderRadius="full" 
                bg="blue.100"
                color="blue.500"
                animation={`${pulse} 2s infinite`}
              >
                <Icon as={FaUserTie} boxSize={10} />
              </Box>
              <Heading size="lg" color="blue.500" fontFamily="'Segoe UI', sans-serif">Mentor Details</Heading>
              <Text fontFamily="'Segoe UI', sans-serif" color={textColor}>
                No mentor has been assigned to you yet.
              </Text>
              <Text fontSize="sm" color="gray.500">
                Our team is working to match you with the perfect mentor. Please check back soon!
              </Text>
              <Button 
                colorScheme="blue" 
                onClick={() => router.push("/student/dashboard")}
                mt={4}
                fontFamily="'Segoe UI', sans-serif"
                rightIcon={<FaRocket />}
              >
                Back to Dashboard
              </Button>
            </VStack>
          </MotionBox>
        </Center>
      </Box>
    </Box>
  );
}

  if (error || !mentorData) {
    return (
      <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" py={10} px={6} position="relative" overflow="hidden">
        {/* Background elements */}
        <Box
          position="absolute"
          top="10%"
          right="10%"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="blue.100"
          opacity="0.2"
          zIndex="0"
          animation={`${float} 8s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          bottom="10%"
          left="10%"
          w="150px"
          h="150px"
          borderRadius="full"
          bg="purple.100"
          opacity="0.2"
          zIndex="0"
          animation={`${float} 10s ease-in-out infinite`}
        />
        
        <Box position="relative" zIndex="1">
          <Button 
            mb={6} 
            colorScheme="blue" 
            variant="outline" 
            onClick={() => router.push("/student/dashboard")}
            leftIcon={<FiArrowLeft />}
            fontFamily="'Segoe UI', sans-serif"
            _hover={{ transform: "translateX(-3px)", shadow: "md" }}
            transition="all 0.2s ease"
          >
            Back to Dashboard
          </Button>
          <Center>
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={4} textAlign="center" p={8} bg={cardBg} borderRadius="xl" boxShadow="xl">
                <Box 
                  p={4} 
                  borderRadius="full" 
                  bg="red.100"
                  color="red.500"
                  animation={`${pulse} 2s infinite`}
                >
                  <Icon as={FiX} boxSize={10} />
                </Box>
                <Heading size="lg" color="red.500" fontFamily="'Segoe UI', sans-serif">Error Loading Mentor</Heading>
                <Text fontFamily="'Segoe UI', sans-serif" color={textColor}>
                  {error || "There was an error loading your mentor information."}
                </Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => window.location.reload()}
                  mt={4}
                  fontFamily="'Segoe UI', sans-serif"
                >
                  Try Again
                </Button>
              </VStack>
            </MotionBox>
          </Center>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={subtleBg} fontFamily="'Segoe UI', sans-serif" position="relative" overflow="hidden">
      {/* Animated background elements */}
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="blue.50"
        opacity="0.3"
        zIndex="0"
        animation={`${float} 6s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="-80px"
        left="-80px"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="purple.50"
        opacity="0.3"
        zIndex="0"
        animation={`${float} 7s ease-in-out infinite`}
      />
      
      {/* Geometric shapes */}
      <Box
        position="absolute"
        top="20%"
        left="5%"
        w="100px"
        h="100px"
        border="2px solid"
        borderColor="blue.200"
        opacity="0.2"
        transform="rotate(45deg)"
        zIndex="0"
      />
      <Box
        position="absolute"
        bottom="20%"
        right="5%"
        w="80px"
        h="80px"
        border="2px solid"
        borderColor="purple.200"
        opacity="0.2"
        transform="rotate(20deg)"
        zIndex="0"
      />
      
      <Box position="relative" zIndex="1" py={8} px={4}>
        <Container maxW="6xl">
          {/* Header Section */}
          <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
            <Button 
              colorScheme="blue" 
              variant="outline" 
              onClick={() => router.push("/student/dashboard")}
              leftIcon={<FiArrowLeft />}
              fontFamily="'Segoe UI', sans-serif"
              borderRadius="lg"
              borderWidth="2px"
              _hover={{ 
                bg: "blue.50",
                boxShadow: "md"
              }}
              transition="all 0.3s"
            >
              Back to Dashboard
            </Button>
            
            <Badge 
              colorScheme="green" 
              p={3} 
              borderRadius="lg" 
              fontSize="md" 
              boxShadow="md"
              fontFamily="'Segoe UI', sans-serif"
            >
              <HStack>
                <FiStar />
                <Text>Mentor Assigned</Text>
              </HStack>
            </Badge>
          </Flex>

          {/* Main Content */}
          <VStack spacing={8} align="stretch">
            {/* Animated Header Card */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              maxW="2xl"
              mx="auto"
              w="full"
            >
              <MotionCard
                bgGradient={mentorGradient}
                color="white"
                borderRadius="xl"
                boxShadow="xl"
                overflow="hidden"
                animation={`${float} 6s ease-in-out infinite`}
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%)",
                  zIndex: 0,
                }}
              >
                <CardBody display="flex" flexDirection="column" justifyContent="center" position="relative" zIndex={1}>
                  <VStack spacing={4} align="stretch" textAlign="center">
                    <Box 
                      p={3} 
                      borderRadius="full" 
                      bg="rgba(255,255,255,0.2)"
                      width="max-content"
                      mx="auto"
                      backdropFilter="blur(10px)"
                    >
                      <Icon as={FaUserTie} boxSize={6} />
                    </Box>
                    
                    <Text fontSize="sm" opacity={0.9} fontWeight="medium">
                      MEET YOUR MENTOR
                    </Text>
                    
                    <Heading size="xl" fontWeight="bold">
                      {mentorData.mentor_name}
                    </Heading>
                    
                    <Text fontSize="md" opacity={0.9}>
                      {mentorData.mentor_designation}
                    </Text>
                  </VStack>
                </CardBody>
              </MotionCard>
            </MotionBox>

            {/* Success Alert */}
            <Alert 
              status="success" 
              borderRadius="xl" 
              variant="left-accent"
              fontFamily="'Segoe UI', sans-serif"
              boxShadow="md"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>Mentor Assigned Successfully!</AlertTitle>
                <AlertDescription>
                  Your mentor has been assigned and will guide you through your internship journey.
                </AlertDescription>
              </Box>
            </Alert>

            {/* Mentor Details Card */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="xl"
              overflow="hidden"
              border="1px solid"
              borderColor={gray100}
              _hover={{ boxShadow: "2xl", transform: "translateY(-5px)" }}
              sx={{ transition: "all 0.3s" }}
            >
              <CardBody>
                <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                  <VStack align="center" spacing={4} flexShrink={0}>
                    <Avatar
                      size="2xl"
                      name={mentorData.mentor_name}
                      src={mentorData.profile_photo}
                      border="4px solid"
                      borderColor={primaryColor}
                      boxShadow="lg"
                    />
                    <Badge colorScheme="green" fontSize="md" p={2} borderRadius="md" boxShadow="sm">
                      Your Mentor
                    </Badge>
                    
                    {/* Social Links */}
                    <VStack spacing={3} align="center">
                      <Text fontWeight="bold" color={textColor}>Connect</Text>
                      <HStack spacing={3}>
                        <Button 
                          size="sm" 
                          colorScheme="blue" 
                          variant="outline" 
                          leftIcon={<FiMail />}
                          onClick={() => {
                            setEmailSubject(`Introduction - ${mentorData.mentor_name}`);
                            setEmailContent(`Dear ${mentorData.mentor_name},\n\nI'm excited to connect with you as my mentor. I'm looking forward to learning from your expertise in ${mentorData.area_of_expertise}.\n\nBest regards,\n[Your Name]`);
                          }}
                        >
                          Message
                        </Button>
                      </HStack>
                    </VStack>
                    
                    {/* Expertise Tags - Changed to Grid layout for better visibility */}
                    <VStack spacing={3} align="center" width="100%">
                      <Text fontWeight="bold" color={textColor}>Areas of Expertise</Text>
                      <Grid templateColumns="repeat(2, 1fr)" gap={2} width="100%">
                        {mentorData.area_of_expertise.split(',').map((expertise, index) => {
                          const IconComponent = getExpertiseIcon(expertise);
                          return (
                            <GridItem key={index} colSpan={1}>
                              <Badge 
                                colorScheme="blue" 
                                variant="subtle" 
                                p={3} 
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                gap={2}
                                bg="blue.50"
                                border="1px solid"
                                borderColor="blue.100"
                                boxShadow="sm"
                                width="100%"
                                height="100%"
                              >
                                <Icon as={IconComponent} boxSize={4} />
                                <Text fontSize="sm" fontWeight="medium">{expertise.trim()}</Text>
                              </Badge>
                            </GridItem>
                          );
                        })}
                      </Grid>
                    </VStack>
                  </VStack>

                  <VStack align="start" spacing={4} flex={1}>
                    <Heading size="lg" color={primaryColor}>{mentorData.mentor_name}</Heading>
                    
                    <Text fontStyle="italic" color={textColor} bg={blue50} p={3} borderRadius="md">
                      {mentorData.bio || "Experienced mentor dedicated to helping students succeed in their internship journey."}
                    </Text>
                    
                    <Divider />
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                      <HStack bg={gray50} p={3} borderRadius="lg">
                        <Box p={2} borderRadius="md" bg="blue.100" color="blue.600">
                          <Icon as={FiBriefcase} />
                        </Box>
                        <VStack align="start" spacing={0} overflow="hidden">
                          <Text fontSize="sm" color="gray.500">Designation</Text>
                          <Text fontWeight="medium" noOfLines={1}>{mentorData.mentor_designation}</Text>
                        </VStack>
                      </HStack>
                      
                      <HStack bg={gray50} p={3} borderRadius="lg">
                        <Box p={2} borderRadius="md" bg="green.100" color="green.600">
                          <Icon as={FiAward} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.500">Experience</Text>
                          <Text fontWeight="medium">{mentorData.years_of_experience} years</Text>
                        </VStack>
                      </HStack>
                      
                      <HStack bg={gray50} p={3} borderRadius="lg">
                        <Box p={2} borderRadius="md" bg="purple.100" color="purple.600">
                          <Icon as={FiMail} />
                        </Box>
                        <VStack align="start" spacing={0} overflow="hidden" flex={1}>
                          <Text fontSize="sm" color="gray.500">Email</Text>
                          <Text fontWeight="medium" fontSize="sm" wordBreak="break-all" noOfLines={1}>
                            {mentorData.mentor_email}
                          </Text>
                        </VStack>
                      </HStack>
                      
                      <HStack bg={gray50} p={3} borderRadius="lg">
                        <Box p={2} borderRadius="md" bg="orange.100" color="orange.600">
                          <Icon as={FiPhone} />
                        </Box>
                        <VStack align="start" spacing={0} overflow="hidden">
                          <Text fontSize="sm" color="gray.500">Contact</Text>
                          <Text fontWeight="medium" noOfLines={1}>{mentorData.mentor_contact}</Text>
                        </VStack>
                      </HStack>
                    </SimpleGrid>
                  </VStack>
                </Flex>
              </CardBody>
            </MotionCard>

            {/* Email Communication Section - Simplified */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="xl"
              overflow="hidden"
              border="1px solid"
              borderColor={gray100}
            >
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={primaryColor}>
                    <Icon as={FiMail} mr={2} />
                    Contact Your Mentor
                  </Heading>
                  
                  <Text color={textColor}>
                    Send a message to your mentor to introduce yourself or ask questions about your internship.
                  </Text>
                  
                  <FormControl>
                    <FormLabel>To</FormLabel>
                    <Input 
                      value={mentorData.mentor_email} 
                      isReadOnly 
                      bg="gray.100" 
                      autoComplete="off"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Subject</FormLabel>
                    <Input 
                      value={emailSubject} 
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject"
                      autoComplete="off"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Your Message</FormLabel>
                    <Textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Write your message to your mentor here..."
                      rows={8}
                      autoComplete="off"
                    />
                  </FormControl>

                  <HStack spacing={3} justify="flex-end">
                    <Button 
                      variant="outline" 
                      onClick={clearEmailForm}
                      leftIcon={<FiX />}
                    >
                      Clear
                    </Button>
                    <Button 
                      colorScheme="blue" 
                      onClick={openEmailClient}
                      leftIcon={<FiMail />}
                      isDisabled={!emailContent.trim()}
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      Open Email Client
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </MotionCard>

            {/* Mentorship Guidelines Card */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              bg="blue.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="blue.100"
              sx={{ transition: "all 0.3s" }}
            >
              <CardBody>
                <VStack spacing={4} align="start">
                  <Heading size="md" color="blue.700">
                    <Icon as={FaGraduationCap} mr={2} />
                    Mentorship Success Guide
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                    <HStack align="start" spacing={3}>
                      <Box p={2} borderRadius="md" bg="blue.100" color="blue.600" flexShrink={0}>
                        <Icon as={FiCalendar} />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="blue.700">Schedule Regular Check-ins</Text>
                        <Text fontSize="sm" color="blue.600">
                          Set up consistent meeting times to discuss progress and challenges
                        </Text>
                      </Box>
                    </HStack>
                    
                    <HStack align="start" spacing={3}>
                      <Box p={2} borderRadius="md" bg="green.100" color="green.600" flexShrink={0}>
                        <Icon as={FiTarget} />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="blue.700">Set Clear Goals</Text>
                        <Text fontSize="sm" color="blue.600">
                          Define what you want to achieve with your mentor&apos;s guidance
                        </Text>
                      </Box>
                    </HStack>
                    
                    <HStack align="start" spacing={3}>
                      <Box p={2} borderRadius="md" bg="purple.100" color="purple.600" flexShrink={0}>
                        <Icon as={FiBookOpen} />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="blue.700">Come Prepared</Text>
                        <Text fontSize="sm" color="blue.600">
                          Bring specific questions and topics to make the most of your time
                        </Text>
                      </Box>
                    </HStack>
                    
                    <HStack align="start" spacing={3}>
                      <Box p={2} borderRadius="md" bg="orange.100" color="orange.600" flexShrink={0}>
                        <Icon as={FiCheckCircle} />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="blue.700">Implement Feedback</Text>
                        <Text fontSize="sm" color="blue.600">
                          Act on the advice and suggestions provided by your mentor
                        </Text>
                      </Box>
                    </HStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </MotionCard>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}