// import {
//   Box,
//   Flex,
//   Heading,
//   Input,
//   Button,
//   Stack,
//   FormControl,
//   FormLabel,
//   InputGroup,
//   InputLeftElement,
//   InputRightElement,
//   IconButton,
//   useToast,
//   Text,
//   Image,
//   Container,
//   VStack,
//   HStack,
//   Card,
//   CardBody,
//   Divider,
//   useColorModeValue,
//   Radio,
//   RadioGroup,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
//   PinInput,
//   PinInputField,
// } from "@chakra-ui/react";
// import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
// import { useRouter } from "next/router";
// import { useState, useEffect, useCallback } from "react";
// import Link from "next/link";
// import {
//   FaUser,
//   FaLock,
//   FaEnvelope,
//   FaGraduationCap,
//   FaChalkboardTeacher,
//   FaRedo,
// } from "react-icons/fa";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

// export default function Signup() {
//   const router = useRouter();
//   const toast = useToast();
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   const [role, setRole] = useState("student");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
//   // CAPTCHA state
//   const [captchaText, setCaptchaText] = useState("");
//   const [userCaptcha, setUserCaptcha] = useState("");
//   const [captchaRefresh, setCaptchaRefresh] = useState(0);
  
//   // OTP state
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [otpTimer, setOtpTimer] = useState(0);

//   // Color values
//   const cardBg = useColorModeValue("white", "gray.800");
//   const inputBg = useColorModeValue("white", "gray.700");
//   const borderColor = useColorModeValue("gray.200", "gray.600");
//   const accentColor = useColorModeValue("blue.600", "blue.400");
//   const accentLight = useColorModeValue("blue.500", "blue.300");
//   const mutedText = useColorModeValue("gray.600", "gray.400");
//   const subtleBg = useColorModeValue("blue.50", "blue.900");

//   // Use useCallback to memoize the showCustomToast function
//   const showCustomToast = useCallback((title, status, description = "") => {
//     const isSuccess = status === "success";
//     const bgColor = isSuccess ? "green.50" : "red.50";
//     const borderColor = isSuccess ? "green.200" : "red.200";
//     const textColor = isSuccess ? "green.800" : "red.800";

//     toast({
//       title,
//       description,
//       status,
//       duration: 3000,
//       isClosable: true,
//       position: "top",
//       containerStyle: {
//         marginTop: "70px",
//         fontFamily: "'Segoe UI', sans-serif",
//         fontSize: "18px",
//         backgroundColor: bgColor,
//         border: `1px solid ${borderColor}`,
//         color: textColor,
//         borderRadius: "12px",
//         padding: "16px",
//         boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//       },
//     });
//   }, [toast]);

//   // Disable browser navigation buttons
//   useEffect(() => {
//     const disableBackButton = () => {
//       window.history.pushState(null, null, window.location.href);
//     };
    
//     window.history.pushState(null, null, window.location.href);
//     window.addEventListener('popstate', disableBackButton);
    
//     const disableContextMenu = (e) => {
//       e.preventDefault();
//       return false;
//     };
    
//     document.addEventListener('contextmenu', disableContextMenu);
    
//     return () => {
//       window.removeEventListener('popstate', disableBackButton);
//       document.removeEventListener('contextmenu', disableContextMenu);
//     };
//   }, []);

//   // Generate CAPTCHA on component mount and refresh
//   useEffect(() => {
//     generateCaptcha();
//   }, [captchaRefresh]);

//   // OTP Timer effect
//   useEffect(() => {
//     let timer;
//     if (otpTimer > 0) {
//       timer = setInterval(() => {
//         setOtpTimer((prev) => prev - 1);
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [otpTimer]);

//   // Generate random CAPTCHA text
//   const generateCaptcha = () => {
//     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     let result = "";
//     const length = 6;
//     for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     setCaptchaText(result);
//     setUserCaptcha("");
//   };

//   // Update email placeholder based on role
//   const getEmailPlaceholder = () => {
//     return role === "mentor" 
//       ? "Enter your @gov.in email address" 
//       : "Enter your email address";
//   };

//   // Update email description based on role
//   const getEmailDescription = () => {
//     return role === "mentor" 
//       ? "Mentors must use a government email address (@gov.in)"
//       : "Enter your personal or university email address";
//   };

//   // Send OTP to user's email
//   const sendOtp = async () => {
//     setOtpLoading(true);
    
//     try {
//       const res = await fetch("/api/send-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           channel: "email", 
//           recipient: email, 
//           purpose: "signup" 
//         }),
//       });

//       const data = await res.json();
//       setOtpLoading(false);

//       if (!res.ok) {
//         showCustomToast(
//           "OTP Sending Failed",
//           "error",
//           data.error || "Failed to send OTP. Please try again."
//         );
//         return false;
//       }

//       showCustomToast(
//         "OTP Sent",
//         "success",
//         "A verification code has been sent to your email."
//       );
//       setOtpSent(true);
//       setOtpTimer(300); // 5 minutes
//       onOpen();
//       return true;
//     } catch (err) {
//       console.error("OTP sending error:", err);
//       setOtpLoading(false);
//       showCustomToast(
//         "Connection Error",
//         "error",
//         "Unable to send OTP. Please check your internet connection and try again."
//       );
//       return false;
//     }
//   };

//   // Verify OTP and complete registration
//   const verifyOtpAndRegister = async () => {
//     setOtpLoading(true);

//     try {
//       const res = await fetch("/api/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           role,
//           name: name.trim(),
//           email: email.trim(),
//           password,
//           otp,
//         }),
//       });

//       const data = await res.json();
//       setOtpLoading(false);

//       if (!res.ok) {
//         showCustomToast(
//           "Registration Failed",
//           "error",
//           data.error || "Invalid OTP or registration failed. Please try again."
//         );
//         return false;
//       }

//       // Store user data in localStorage
//       const userObj = {
//         userId: data.user_id,
//         name: name.trim(),
//         email: email.trim(),
//         role: role,
//         student_id: data.student_id
//       };
//       localStorage.setItem("user", JSON.stringify(userObj));
//       localStorage.setItem("userId", data.user_id);

//       showCustomToast(
//         "Account Created Successfully!",
//         "success",
//         role === "student" 
//           ? "Welcome to the Internship Portal! Redirecting to your profile setup..." 
//           : "Welcome Mentor! Redirecting to profile creation..."
//       );
      
//       setOtpVerified(true);
//       onClose();

//       // Redirect based on role after a short delay
//       setTimeout(() => {
//         if (role === "student") {
//           router.push("/createprofile");
//         } else if (role === "mentor") {
//           router.push("/mentor/createprofile");
//         }
//       }, 1500);
      
//       return true;
//     } catch (err) {
//       console.error("Registration error:", err);
//       setOtpLoading(false);
//       showCustomToast("Connection Error", "error", "Unable to complete registration. Please try again.");
//       return false;
//     }
//   };

//   const validateForm = () => {
//     const errors = [];

//     if (!name.trim()) {
//       errors.push({
//         field: "name",
//         message: "Please enter your full name",
//         toast: {
//           title: "Name Required",
//           description: "Please enter your full name to continue.",
//         },
//       });
//     } else if (name.trim().length < 2) {
//       errors.push({
//         field: "name",
//         message: "Name must be at least 2 characters",
//         toast: {
//           title: "Invalid Name",
//           description: "Please enter your full name (at least 2 characters).",
//         },
//       });
//     }

//     if (!email.trim()) {
//       errors.push({
//         field: "email",
//         message: "Please enter your email address",
//         toast: {
//           title: "Email Required",
//           description: "Please enter your email address to continue.",
//         },
//       });
//     } else {
//       // Different email validation based on role
//       if (role === "mentor") {
//         // For mentors: must be @gov.in domain
//         const mentorEmailRegex = /^[^\s@]+@gov\.in$/i;
//         if (!mentorEmailRegex.test(email)) {
//           errors.push({
//             field: "email",
//             message: "Mentors must use a government email address (@gov.in)",
//             toast: {
//               title: "Invalid Mentor Email",
//               description: "Mentors must register with a government email address (@gov.in).",
//             },
//           });
//         }
//       } else {
//         // For students: regular email validation
//         const studentEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!studentEmailRegex.test(email)) {
//           errors.push({
//             field: "email",
//             message: "Please enter a valid email address",
//             toast: {
//               title: "Invalid Email",
//               description: "Please enter a valid email address (e.g., example@domain.com).",
//             },
//           });
//         }
//       }
//     }

//     if (!password) {
//       errors.push({
//         field: "password",
//         message: "Please create a password",
//         toast: {
//           title: "Password Required",
//           description: "Please create a password to secure your account.",
//         },
//       });
//     } else {
//       if (password.length < 8) {
//         errors.push({
//           field: "password",
//           message: "Password must be at least 8 characters",
//           toast: {
//             title: "Weak Password",
//             description: "Password must be at least 8 characters long.",
//           },
//         });
//       }

//       if (!/(?=.*[A-Z])/.test(password)) {
//         errors.push({
//           field: "password",
//           message: "Password must contain an uppercase letter",
//           toast: {
//             title: "Password Requirements",
//             description: "Password must contain at least one uppercase letter.",
//           },
//         });
//       }

//       if (!/(?=.*\d)/.test(password)) {
//         errors.push({
//           field: "password",
//           message: "Password must contain a number",
//           toast: {
//             title: "Password Requirements",
//             description: "Password must contain at least one number.",
//           },
//         });
//       }

//       if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
//         errors.push({
//           field: "password",
//           message: "Password must contain a symbol",
//           toast: {
//             title: "Password Requirements",
//             description: "Password must contain at least one symbol (e.g., !@#$%^&*).",
//           },
//         });
//       }
//     }

//     if (!confirmPassword) {
//       errors.push({
//         field: "confirmPassword",
//         message: "Please confirm your password",
//         toast: {
//           title: "Confirm Password",
//           description: "Please confirm your password to continue.",
//         },
//       });
//     } else if (password !== confirmPassword) {
//       errors.push({
//         field: "confirmPassword",
//         message: "Passwords do not match",
//         toast: {
//           title: "Passwords Don't Match",
//           description: "Please make sure both password fields match exactly.",
//         },
//       });
//     }

//     // CAPTCHA validation
//     if (!userCaptcha) {
//       errors.push({
//         field: "captcha",
//         message: "Please enter the CAPTCHA code",
//         toast: {
//           title: "CAPTCHA Required",
//           description: "Please enter the CAPTCHA code to continue.",
//         },
//       });
//     } else if (userCaptcha !== captchaText) {
//       errors.push({
//         field: "captcha",
//         message: "CAPTCHA code is incorrect",
//         toast: {
//           title: "Invalid CAPTCHA",
//           description: "The CAPTCHA code you entered is incorrect. Please try again.",
//         },
//       });
//     }

//     if (errors.length > 0) {
//       showCustomToast(
//         errors[0].toast.title,
//         "error",
//         errors[0].toast.description
//       );
//       return false;
//     }

//     return true;
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     // Send OTP if not already sent
//     if (!otpSent) {
//       const otpSentSuccess = await sendOtp();
//       return;
//     }

//     // If OTP is already sent but not verified, show message to complete verification
//     if (otpSent && !otpVerified) {
//       showCustomToast("Info", "info", "Please complete the OTP verification process.");
//       onOpen();
//     }
//   };

//   return (
//     <Flex direction="column" minH="100vh" fontFamily="'Segoe UI', sans-serif">
//       <Navbar />

//       <Box
//         flex="1"
//         bg={subtleBg}
//         display="flex"
//         alignItems="center"
//         justifyContent="center"
//         py={10}
//         px={4}
//         backgroundImage="url('/pattern.svg')"
//         backgroundSize="500px"
//         backgroundPosition="center"
//         backgroundRepeat="no-repeat"
//         backgroundBlendMode="soft-light"
//         opacity="0.97"
//       >
//         <Container maxW="lg">
//           <Card
//             shadow="2xl"
//             bg={cardBg}
//             border="1px solid"
//             borderColor={borderColor}
//             borderRadius="2xl"
//             overflow="hidden"
//             width="100%"
//             maxW="500px"
//             mx="auto"
//           >
//             <Box
//               bgGradient="linear(to-r, blue.600, blue.500)"
//               height="8px"
//               width="100%"
//             />

//             <CardBody p={10}>
//               <VStack
//                 spacing={7}
//                 align="stretch"
//                 as="form"
//                 onSubmit={handleSignup}
//                 autoComplete="off"
//                 noValidate
//               >
//                 <VStack spacing={4} textAlign="center">
//                   <Box
//                     position="relative"
//                     width="130px"
//                     height="130px"
//                     mx="auto"
//                     mb={2}
//                   >
//                     <Box
//                       position="absolute"
//                       top="50%"
//                       left="50%"
//                       transform="translate(-50%, -50%)"
//                       width="110px"
//                       height="110px"
//                       borderRadius="full"
//                       bg="blue.100"
//                       opacity="0.6"
//                       zIndex="0"
//                     />

//                     <Box
//                       width="110px"
//                       height="110px"
//                       borderRadius="full"
//                       border="4px solid"
//                       borderColor={accentColor}
//                       position="absolute"
//                       top="50%"
//                       left="50%"
//                       transform="translate(-50%, -50%)"
//                       zIndex="1"
//                       overflow="hidden"
//                       display="flex"
//                       alignItems="center"
//                       justifyContent="center"
//                       bg="white"
//                     >
//                       <Image
//                         src="/logo.png"
//                         alt="Internship Portal Logo"
//                         width="100px"
//                         height="100px"
//                         objectFit="contain"
//                       />
//                     </Box>
//                   </Box>

//                   <Heading
//                     as="h1"
//                     size="xl"
//                     fontWeight="bold"
//                     color={accentColor}
//                     letterSpacing="-0.5px"
//                     fontFamily="'Segoe UI', sans-serif"
//                     fontSize="32px"
//                   >
//                     Create Account
//                   </Heading>

//                   <Text
//                     color={mutedText}
//                     fontSize="lg"
//                     fontWeight="medium"
//                     maxW="300px"
//                     mx="auto"
//                     fontFamily="'Segoe UI', sans-serif"
//                   >
//                     Join the internship portal to start your professional journey
//                   </Text>
//                 </VStack>

//                 <Divider borderColor={borderColor} />

//                 <Stack spacing={6}>
//                   <FormControl>
//                     <FormLabel
//                       fontSize="lg"
//                       fontWeight="600"
//                       color="gray.700"
//                       mb={3}
//                       fontFamily="'Segoe UI', sans-serif"
//                     >
//                       I am a
//                     </FormLabel>
//                     <RadioGroup onChange={setRole} value={role}>
//                       <HStack spacing={6} justify="center">
//                         <Radio value="student" colorScheme="blue" size="lg">
//                           <HStack spacing={2} fontFamily="'Segoe UI', sans-serif">
//                             <FaGraduationCap size="18px" />
//                             <Text fontSize="lg" fontFamily="'Segoe UI', sans-serif">Student</Text>
//                           </HStack>
//                         </Radio>
//                         <Radio value="mentor" colorScheme="blue" size="lg">
//                           <HStack spacing={2} fontFamily="'Segoe UI', sans-serif">
//                             <FaChalkboardTeacher size="18px" />
//                             <Text fontSize="lg" fontFamily="'Segoe UI', sans-serif">Mentor</Text>
//                           </HStack>
//                         </Radio>
//                       </HStack>
//                     </RadioGroup>
//                   </FormControl>

//                   <FormControl>
//                     <FormLabel
//                       fontSize="lg"
//                       fontWeight="600"
//                       color="gray.700"
//                       mb={3}
//                       fontFamily="'Segoe UI', sans-serif"
//                     >
//                       Full Name
//                     </FormLabel>
//                     <InputGroup size="lg">
//                       <InputLeftElement
//                         pointerEvents="none"
//                         color="gray.500"
//                         height="100%"
//                       >
//                         <FaUser size="18px" />
//                       </InputLeftElement>
//                       <Input
//                         type="text"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         placeholder="Enter your full name"
//                         height="56px"
//                         bg={inputBg}
//                         borderColor={borderColor}
//                         fontSize="lg"
//                         pl={12}
//                         _hover={{ borderColor: "gray.300" }}
//                         _focus={{
//                           borderColor: accentColor,
//                           boxShadow: `0 0 0 2px ${accentColor}20`,
//                         }}
//                         autoComplete="off"
//                         fontFamily="'Segoe UI', sans-serif"
//                       />
//                     </InputGroup>
//                   </FormControl>

//                   <FormControl>
//                     <FormLabel
//                       fontSize="lg"
//                       fontWeight="600"
//                       color="gray.700"
//                       mb={3}
//                       fontFamily="'Segoe UI', sans-serif"
//                     >
//                       Email Address
//                     </FormLabel>
//                     <InputGroup size="lg">
//                       <InputLeftElement
//                         pointerEvents="none"
//                         color="gray.500"
//                         height="100%"
//                       >
//                         <FaEnvelope size="18px" />
//                       </InputLeftElement>
//                       <Input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder={getEmailPlaceholder()}
//                         height="56px"
//                         bg={inputBg}
//                         borderColor={borderColor}
//                         fontSize="lg"
//                         pl={12}
//                         _hover={{ borderColor: "gray.300" }}
//                         _focus={{
//                           borderColor: accentColor,
//                           boxShadow: `0 0 0 2px ${accentColor}20`,
//                         }}
//                         autoComplete="off"
//                         fontFamily="'Segoe UI', sans-serif"
//                       />
//                     </InputGroup>
//                     <Text fontSize="md" color={mutedText} mt={3} fontFamily="'Segoe UI', sans-serif">
//                       {getEmailDescription()}
//                     </Text>
//                   </FormControl>

//                   <FormControl>
//                     <FormLabel
//                       fontSize="lg"
//                       fontWeight="600"
//                       color="gray.700"
//                       mb={3}
//                       fontFamily="'Segoe UI', sans-serif"
//                     >
//                       Password
//                     </FormLabel>
//                     <InputGroup size="lg">
//                       <InputLeftElement
//                         pointerEvents="none"
//                         color="gray.500"
//                         height="100%"
//                       >
//                         <FaLock size="18px" />
//                       </InputLeftElement>
//                       <Input
//                         type={showPassword ? "text" : "password"}
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Create a strong password"
//                         height="56px"
//                         bg={inputBg}
//                         borderColor={borderColor}
//                         fontSize="lg"
//                         pl={12}
//                         _hover={{ borderColor: "gray.300" }}
//                         _focus={{
//                           borderColor: accentColor,
//                           boxShadow: `0 0 0 2px ${accentColor}20`,
//                         }}
//                         autoComplete="new-password"
//                         fontFamily="'Segoe UI', sans-serif"
//                       />
//                       <InputRightElement height="100%">
//                         <IconButton
//                           aria-label={
//                             showPassword ? "Hide password" : "Show password"
//                           }
//                           icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
//                           variant="ghost"
//                           size="md"
//                           color="gray.500"
//                           _hover={{ color: accentColor, bg: "transparent" }}
//                           onClick={() => setShowPassword(!showPassword)}
//                         />
//                       </InputRightElement>
//                     </InputGroup>
//                     <Text fontSize="md" color={mutedText} mt={3} fontFamily="'Segoe UI', sans-serif">
//                       Must be at least 8 characters with one uppercase letter,
//                       one number, and one symbol
//                     </Text>
//                   </FormControl>

//                   <FormControl>
//                     <FormLabel
//                       fontSize="lg"
//                       fontWeight="600"
//                       color="gray.700"
//                       mb={3}
//                       fontFamily="'Segoe UI', sans-serif"
//                     >
//                       Confirm Password
//                     </FormLabel>
//                     <InputGroup size="lg">
//                       <InputLeftElement
//                         pointerEvents="none"
//                         color="gray.500"
//                         height="100%"
//                       >
//                         <FaLock size="18px" />
//                       </InputLeftElement>
//                       <Input
//                         type={showConfirmPassword ? "text" : "password"}
//                         value={confirmPassword}
//                         onChange={(e) => setConfirmPassword(e.target.value)}
//                         placeholder="Confirm your password"
//                         height="56px"
//                         bg={inputBg}
//                         borderColor={borderColor}
//                         fontSize="lg"
//                         pl={12}
//                         _hover={{ borderColor: "gray.300" }}
//                         _focus={{
//                           borderColor: accentColor,
//                           boxShadow: `0 0 0 2px ${accentColor}20`,
//                         }}
//                         autoComplete="new-password"
//                         fontFamily="'Segoe UI', sans-serif"
//                       />
//                       <InputRightElement height="100%">
//                         <IconButton
//                           aria-label={
//                             showConfirmPassword
//                               ? "Hide password"
//                               : "Show password"
//                           }
//                           icon={
//                             showConfirmPassword ? (
//                               <ViewOffIcon />
//                             ) : (
//                               <ViewIcon />
//                             )
//                           }
//                           variant="ghost"
//                           size="md"
//                           color="gray.500"
//                           _hover={{ color: accentColor, bg: "transparent" }}
//                           onClick={() =>
//                             setShowConfirmPassword(!showConfirmPassword)
//                           }
//                         />
//                       </InputRightElement>
//                     </InputGroup>
//                   </FormControl>

//                   {/* CAPTCHA Section */}
//                   <FormControl>
//                     <FormLabel
//                       fontSize="lg"
//                       fontWeight="600"
//                       color="gray.700"
//                       mb={3}
//                       fontFamily="'Segoe UI', sans-serif"
//                     >
//                       CAPTCHA Verification
//                     </FormLabel>
//                     <VStack spacing={3} align="stretch">
//                       <HStack spacing={3} align="center">
//                         <Box
//                           flex="1"
//                           bg="gray.100"
//                           p={3}
//                           borderRadius="md"
//                           textAlign="center"
//                           fontWeight="bold"
//                           fontSize="xl"
//                           letterSpacing="3px"
//                           fontFamily="monospace"
//                           color="gray.800"
//                           userSelect="none"
//                         >
//                           {captchaText}
//                         </Box>
//                         <IconButton
//                           aria-label="Refresh CAPTCHA"
//                           icon={<FaRedo />}
//                           onClick={() => {
//                             setCaptchaRefresh(prev => prev + 1);
//                             setUserCaptcha("");
//                           }}
//                           colorScheme="blue"
//                           variant="outline"
//                         />
//                       </HStack>
//                       <Input
//                         type="text"
//                         value={userCaptcha}
//                         onChange={(e) => setUserCaptcha(e.target.value)}
//                         placeholder="Enter the code above"
//                         height="56px"
//                         bg={inputBg}
//                         borderColor={borderColor}
//                         fontSize="lg"
//                         _hover={{ borderColor: "gray.300" }}
//                         _focus={{
//                           borderColor: accentColor,
//                           boxShadow: `0 0 0 2px ${accentColor}20`,
//                         }}
//                         autoComplete="off"
//                         fontFamily="'Segoe UI', sans-serif"
//                       />
//                     </VStack>
//                   </FormControl>

//                   <Button
//                     colorScheme="blue"
//                     size="lg"
//                     height="56px"
//                     type="submit"
//                     isLoading={loading || otpLoading}
//                     fontWeight="bold"
//                     fontSize="lg"
//                     mt={3}
//                     bgGradient="linear(to-r, blue.600, blue.500)"
//                     _hover={{
//                       transform: "translateY(-2px)",
//                       shadow: "lg",
//                       bgGradient: "linear(to-r, blue.700, blue.600)",
//                     }}
//                     _active={{
//                       bgGradient: "linear(to-r, blue.700, blue.600)",
//                     }}
//                     transition="all 0.2s"
//                     borderRadius="12px"
//                     fontFamily="'Segoe UI', sans-serif"
//                   >
//                     {otpSent ? "Complete Verification" : "Verify Email"}
//                   </Button>
//                 </Stack>

//                 <HStack justify="center" pt={4} spacing={2}>
//                   <Text color={mutedText} fontSize="lg" fontFamily="'Segoe UI', sans-serif">
//                     Already have an account?
//                   </Text>
//                   <Link href="/login" passHref>
//                     <Button
//                       variant="link"
//                       color={accentColor}
//                       fontWeight="bold"
//                       fontSize="lg"
//                       _hover={{ textDecoration: "none", color: accentLight }}
//                       fontFamily="'Segoe UI', sans-serif"
//                     >
//                       Log In
//                     </Button>
//                   </Link>
//                 </HStack>
//               </VStack>
//             </CardBody>
//           </Card>
//         </Container>
//       </Box>

//       {/* OTP Verification Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} isCentered>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader textAlign="center" fontFamily="'Segoe UI', sans-serif">
//             Verify Your Email
//           </ModalHeader>
//           <ModalCloseButton />
//           <ModalBody pb={6}>
//             <VStack spacing={4}>
//               <Text textAlign="center" fontFamily="'Segoe UI', sans-serif">
//                 Enter the 6-digit code sent to {email}
//               </Text>
//               <Text fontSize="sm" color="gray.500">
//                 Time remaining: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
//               </Text>
//               <HStack justify="center">
//                 <PinInput otp value={otp} onChange={setOtp}>
//                   {Array.from({ length: 6 }).map((_, index) => (
//                     <PinInputField key={index} />
//                   ))}
//                 </PinInput>
//               </HStack>
//               <Button
//                 colorScheme="blue"
//                 width="full"
//                 onClick={verifyOtpAndRegister}
//                 isLoading={otpLoading}
//                 fontFamily="'Segoe UI', sans-serif"
//               >
//                 Verify Code & Create Account
//               </Button>
//               <Button
//                 variant="link"
//                 onClick={sendOtp}
//                 isDisabled={otpTimer > 0}
//                 fontFamily="'Segoe UI', sans-serif"
//               >
//                 {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend Code'}
//               </Button>
//             </VStack>
//           </ModalBody>
//         </ModalContent>
//       </Modal>

//       <Footer />
//     </Flex>
//   );
// }




import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  Stack,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  useToast,
  Text,
  Image,
  Container,
  VStack,
  HStack,
  Card,
  CardBody,
  Divider,
  useColorModeValue,
  Radio,
  RadioGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaRedo,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Signup() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // CAPTCHA state
  const [captchaText, setCaptchaText] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captchaRefresh, setCaptchaRefresh] = useState(0);
  
  // OTP state
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("blue.600", "blue.400");
  const accentLight = useColorModeValue("blue.500", "blue.300");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const subtleBg = useColorModeValue("blue.50", "blue.900");

  // Use useCallback to memoize the showCustomToast function
  const showCustomToast = useCallback((title, status, description = "") => {
    const isSuccess = status === "success";
    const bgColor = isSuccess ? "green.50" : "red.50";
    const borderColor = isSuccess ? "green.200" : "red.200";
    const textColor = isSuccess ? "green.800" : "red.800";

    toast({
      title,
      description,
      status,
      duration: 3000,
      isClosable: true,
      position: "top",
      containerStyle: {
        marginTop: "70px",
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: "18px",
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    });
  }, [toast]);

  // Disable browser navigation buttons
  useEffect(() => {
    const disableBackButton = () => {
      window.history.pushState(null, null, window.location.href);
    };
    
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', disableBackButton);
    
    const disableContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('contextmenu', disableContextMenu);
    
    return () => {
      window.removeEventListener('popstate', disableBackButton);
      document.removeEventListener('contextmenu', disableContextMenu);
    };
  }, []);

  // Generate CAPTCHA on component mount and refresh
  useEffect(() => {
    generateCaptcha();
  }, [captchaRefresh]);

  // OTP Timer effect
  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  // Generate random CAPTCHA text
  const generateCaptcha = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const length = 6;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCaptchaText(result);
    setUserCaptcha("");
  };

  // Update email placeholder based on role
  const getEmailPlaceholder = () => {
    return role === "mentor" 
      ? "Enter your email address (e.g., mentor@company.com)" 
      : "Enter your email address";
  };

  // Update email description based on role - removed gov.in restriction
  const getEmailDescription = () => {
    return role === "mentor" 
      ? "Enter your professional or personal email address"
      : "Enter your personal or university email address";
  };

  // Send OTP to user's email
  const sendOtp = async () => {
    setOtpLoading(true);
    
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          channel: "email", 
          recipient: email, 
          purpose: "signup" 
        }),
      });

      const data = await res.json();
      setOtpLoading(false);

      if (!res.ok) {
        showCustomToast(
          "OTP Sending Failed",
          "error",
          data.error || "Failed to send OTP. Please try again."
        );
        return false;
      }

      showCustomToast(
        "OTP Sent",
        "success",
        "A verification code has been sent to your email."
      );
      setOtpSent(true);
      setOtpTimer(300); // 5 minutes
      onOpen();
      return true;
    } catch (err) {
      console.error("OTP sending error:", err);
      setOtpLoading(false);
      showCustomToast(
        "Connection Error",
        "error",
        "Unable to send OTP. Please check your internet connection and try again."
      );
      return false;
    }
  };

  // Verify OTP and complete registration
  const verifyOtpAndRegister = async () => {
    setOtpLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name: name.trim(),
          email: email.trim(),
          password,
          otp,
        }),
      });

      const data = await res.json();
      setOtpLoading(false);

      if (!res.ok) {
        showCustomToast(
          "Registration Failed",
          "error",
          data.error || "Invalid OTP or registration failed. Please try again."
        );
        return false;
      }

      // Store user data in localStorage
      const userObj = {
        userId: data.user_id,
        name: name.trim(),
        email: email.trim(),
        role: role,
        student_id: data.student_id,
        mentor_id: data.mentor_id
      };
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("userId", data.user_id);

      showCustomToast(
        "Account Created Successfully!",
        "success",
        role === "student" 
          ? "Welcome to the Internship Portal! Redirecting to your profile setup..." 
          : "Welcome Mentor! Redirecting to profile creation..."
      );
      
      setOtpVerified(true);
      onClose();

      // Redirect based on role after a short delay
      setTimeout(() => {
        if (role === "student") {
          router.push("/createprofile");
        } else if (role === "mentor") {
          router.push("/mentor/createprofile");
        }
      }, 1500);
      
      return true;
    } catch (err) {
      console.error("Registration error:", err);
      setOtpLoading(false);
      showCustomToast("Connection Error", "error", "Unable to complete registration. Please try again.");
      return false;
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!name.trim()) {
      errors.push({
        field: "name",
        message: "Please enter your full name",
        toast: {
          title: "Name Required",
          description: "Please enter your full name to continue.",
        },
      });
    } else if (name.trim().length < 2) {
      errors.push({
        field: "name",
        message: "Name must be at least 2 characters",
        toast: {
          title: "Invalid Name",
          description: "Please enter your full name (at least 2 characters).",
        },
      });
    }

    if (!email.trim()) {
      errors.push({
        field: "email",
        message: "Please enter your email address",
        toast: {
          title: "Email Required",
          description: "Please enter your email address to continue.",
        },
      });
    } else {
      // Simple email validation for both roles - removed @gov.in restriction
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({
          field: "email",
          message: "Please enter a valid email address",
          toast: {
            title: "Invalid Email",
            description: "Please enter a valid email address (e.g., example@domain.com).",
          },
        });
      }
    }

    if (!password) {
      errors.push({
        field: "password",
        message: "Please create a password",
        toast: {
          title: "Password Required",
          description: "Please create a password to secure your account.",
        },
      });
    } else {
      if (password.length < 8) {
        errors.push({
          field: "password",
          message: "Password must be at least 8 characters",
          toast: {
            title: "Weak Password",
            description: "Password must be at least 8 characters long.",
          },
        });
      }

      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push({
          field: "password",
          message: "Password must contain an uppercase letter",
          toast: {
            title: "Password Requirements",
            description: "Password must contain at least one uppercase letter.",
          },
        });
      }

      if (!/(?=.*\d)/.test(password)) {
        errors.push({
          field: "password",
          message: "Password must contain a number",
          toast: {
            title: "Password Requirements",
            description: "Password must contain at least one number.",
          },
        });
      }

      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
        errors.push({
          field: "password",
          message: "Password must contain a symbol",
          toast: {
            title: "Password Requirements",
            description: "Password must contain at least one symbol (e.g., !@#$%^&*).",
          },
        });
      }
    }

    if (!confirmPassword) {
      errors.push({
        field: "confirmPassword",
        message: "Please confirm your password",
        toast: {
          title: "Confirm Password",
          description: "Please confirm your password to continue.",
        },
      });
    } else if (password !== confirmPassword) {
      errors.push({
        field: "confirmPassword",
        message: "Passwords do not match",
        toast: {
          title: "Passwords Don't Match",
          description: "Please make sure both password fields match exactly.",
        },
      });
    }

    // CAPTCHA validation
    if (!userCaptcha) {
      errors.push({
        field: "captcha",
        message: "Please enter the CAPTCHA code",
        toast: {
          title: "CAPTCHA Required",
          description: "Please enter the CAPTCHA code to continue.",
        },
      });
    } else if (userCaptcha !== captchaText) {
      errors.push({
        field: "captcha",
        message: "CAPTCHA code is incorrect",
        toast: {
          title: "Invalid CAPTCHA",
          description: "The CAPTCHA code you entered is incorrect. Please try again.",
        },
      });
    }

    if (errors.length > 0) {
      showCustomToast(
        errors[0].toast.title,
        "error",
        errors[0].toast.description
      );
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Send OTP if not already sent
    if (!otpSent) {
      const otpSentSuccess = await sendOtp();
      return;
    }

    // If OTP is already sent but not verified, show message to complete verification
    if (otpSent && !otpVerified) {
      showCustomToast("Info", "info", "Please complete the OTP verification process.");
      onOpen();
    }
  };

  return (
    <Flex direction="column" minH="100vh" fontFamily="'Segoe UI', sans-serif">
      <Navbar />

      <Box
        flex="1"
        bg={subtleBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        py={10}
        px={4}
        backgroundImage="url('/pattern.svg')"
        backgroundSize="500px"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        backgroundBlendMode="soft-light"
        opacity="0.97"
      >
        <Container maxW="lg">
          <Card
            shadow="2xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="2xl"
            overflow="hidden"
            width="100%"
            maxW="500px"
            mx="auto"
          >
            <Box
              bgGradient="linear(to-r, blue.600, blue.500)"
              height="8px"
              width="100%"
            />

            <CardBody p={10}>
              <VStack
                spacing={7}
                align="stretch"
                as="form"
                onSubmit={handleSignup}
                autoComplete="off"
                noValidate
              >
                <VStack spacing={4} textAlign="center">
                  <Box
                    position="relative"
                    width="130px"
                    height="130px"
                    mx="auto"
                    mb={2}
                  >
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      width="110px"
                      height="110px"
                      borderRadius="full"
                      bg="blue.100"
                      opacity="0.6"
                      zIndex="0"
                    />

                    <Box
                      width="110px"
                      height="110px"
                      borderRadius="full"
                      border="4px solid"
                      borderColor={accentColor}
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      zIndex="1"
                      overflow="hidden"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="white"
                    >
                      <Image
                        src="/logo.png"
                        alt="Internship Portal Logo"
                        width="100px"
                        height="100px"
                        objectFit="contain"
                      />
                    </Box>
                  </Box>

                  <Heading
                    as="h1"
                    size="xl"
                    fontWeight="bold"
                    color={accentColor}
                    letterSpacing="-0.5px"
                    fontFamily="'Segoe UI', sans-serif"
                    fontSize="32px"
                  >
                    Create Account
                  </Heading>

                  <Text
                    color={mutedText}
                    fontSize="lg"
                    fontWeight="medium"
                    maxW="300px"
                    mx="auto"
                    fontFamily="'Segoe UI', sans-serif"
                  >
                    Join the internship portal to start your professional journey
                  </Text>
                </VStack>

                <Divider borderColor={borderColor} />

                <Stack spacing={6}>
                  <FormControl>
                    <FormLabel
                      fontSize="lg"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      I am a
                    </FormLabel>
                    <RadioGroup onChange={setRole} value={role}>
                      <HStack spacing={6} justify="center">
                        <Radio value="student" colorScheme="blue" size="lg">
                          <HStack spacing={2} fontFamily="'Segoe UI', sans-serif">
                            <FaGraduationCap size="18px" />
                            <Text fontSize="lg" fontFamily="'Segoe UI', sans-serif">Student</Text>
                          </HStack>
                        </Radio>
                        <Radio value="mentor" colorScheme="blue" size="lg">
                          <HStack spacing={2} fontFamily="'Segoe UI', sans-serif">
                            <FaChalkboardTeacher size="18px" />
                            <Text fontSize="lg" fontFamily="'Segoe UI', sans-serif">Mentor</Text>
                          </HStack>
                        </Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      fontSize="lg"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      Full Name
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.500"
                        height="100%"
                      >
                        <FaUser size="18px" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        height="56px"
                        bg={inputBg}
                        borderColor={borderColor}
                        fontSize="lg"
                        pl={12}
                        _hover={{ borderColor: "gray.300" }}
                        _focus={{
                          borderColor: accentColor,
                          boxShadow: `0 0 0 2px ${accentColor}20`,
                        }}
                        autoComplete="off"
                        fontFamily="'Segoe UI', sans-serif"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      fontSize="lg"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      Email Address
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.500"
                        height="100%"
                      >
                        <FaEnvelope size="18px" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={getEmailPlaceholder()}
                        height="56px"
                        bg={inputBg}
                        borderColor={borderColor}
                        fontSize="lg"
                        pl={12}
                        _hover={{ borderColor: "gray.300" }}
                        _focus={{
                          borderColor: accentColor,
                          boxShadow: `0 0 0 2px ${accentColor}20`,
                        }}
                        autoComplete="off"
                        fontFamily="'Segoe UI', sans-serif"
                      />
                    </InputGroup>
                    <Text fontSize="md" color={mutedText} mt={3} fontFamily="'Segoe UI', sans-serif">
                      {getEmailDescription()}
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      fontSize="lg"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      Password
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.500"
                        height="100%"
                      >
                        <FaLock size="18px" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        height="56px"
                        bg={inputBg}
                        borderColor={borderColor}
                        fontSize="lg"
                        pl={12}
                        _hover={{ borderColor: "gray.300" }}
                        _focus={{
                          borderColor: accentColor,
                          boxShadow: `0 0 0 2px ${accentColor}20`,
                        }}
                        autoComplete="new-password"
                        fontFamily="'Segoe UI', sans-serif"
                      />
                      <InputRightElement height="100%">
                        <IconButton
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          variant="ghost"
                          size="md"
                          color="gray.500"
                          _hover={{ color: accentColor, bg: "transparent" }}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <Text fontSize="md" color={mutedText} mt={3} fontFamily="'Segoe UI', sans-serif">
                      Must be at least 8 characters with one uppercase letter,
                      one number, and one symbol
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      fontSize="lg"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      Confirm Password
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.500"
                        height="100%"
                      >
                        <FaLock size="18px" />
                      </InputLeftElement>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        height="56px"
                        bg={inputBg}
                        borderColor={borderColor}
                        fontSize="lg"
                        pl={12}
                        _hover={{ borderColor: "gray.300" }}
                        _focus={{
                          borderColor: accentColor,
                          boxShadow: `0 0 0 2px ${accentColor}20`,
                        }}
                        autoComplete="new-password"
                        fontFamily="'Segoe UI', sans-serif"
                      />
                      <InputRightElement height="100%">
                        <IconButton
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          icon={
                            showConfirmPassword ? (
                              <ViewOffIcon />
                            ) : (
                              <ViewIcon />
                            )
                          }
                          variant="ghost"
                          size="md"
                          color="gray.500"
                          _hover={{ color: accentColor, bg: "transparent" }}
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {/* CAPTCHA Section */}
                  <FormControl>
                    <FormLabel
                      fontSize="lg"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      CAPTCHA Verification
                    </FormLabel>
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={3} align="center">
                        <Box
                          flex="1"
                          bg="gray.100"
                          p={3}
                          borderRadius="md"
                          textAlign="center"
                          fontWeight="bold"
                          fontSize="xl"
                          letterSpacing="3px"
                          fontFamily="monospace"
                          color="gray.800"
                          userSelect="none"
                        >
                          {captchaText}
                        </Box>
                        <IconButton
                          aria-label="Refresh CAPTCHA"
                          icon={<FaRedo />}
                          onClick={() => {
                            setCaptchaRefresh(prev => prev + 1);
                            setUserCaptcha("");
                          }}
                          colorScheme="blue"
                          variant="outline"
                        />
                      </HStack>
                      <Input
                        type="text"
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                        placeholder="Enter the code above"
                        height="56px"
                        bg={inputBg}
                        borderColor={borderColor}
                        fontSize="lg"
                        _hover={{ borderColor: "gray.300" }}
                        _focus={{
                          borderColor: accentColor,
                          boxShadow: `0 0 0 2px ${accentColor}20`,
                        }}
                        autoComplete="off"
                        fontFamily="'Segoe UI', sans-serif"
                      />
                    </VStack>
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    size="lg"
                    height="56px"
                    type="submit"
                    isLoading={loading || otpLoading}
                    fontWeight="bold"
                    fontSize="lg"
                    mt={3}
                    bgGradient="linear(to-r, blue.600, blue.500)"
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "lg",
                      bgGradient: "linear(to-r, blue.700, blue.600)",
                    }}
                    _active={{
                      bgGradient: "linear(to-r, blue.700, blue.600)",
                    }}
                    transition="all 0.2s"
                    borderRadius="12px"
                    fontFamily="'Segoe UI', sans-serif"
                  >
                    {otpSent ? "Complete Verification" : "Verify Email"}
                  </Button>
                </Stack>

                <HStack justify="center" pt={4} spacing={2}>
                  <Text color={mutedText} fontSize="lg" fontFamily="'Segoe UI', sans-serif">
                    Already have an account?
                  </Text>
                  <Link href="/login" passHref>
                    <Button
                      variant="link"
                      color={accentColor}
                      fontWeight="bold"
                      fontSize="lg"
                      _hover={{ textDecoration: "none", color: accentLight }}
                      fontFamily="'Segoe UI', sans-serif"
                    >
                      Log In
                    </Button>
                  </Link>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>

      {/* OTP Verification Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" fontFamily="'Segoe UI', sans-serif">
            Verify Your Email
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text textAlign="center" fontFamily="'Segoe UI', sans-serif">
                Enter the 6-digit code sent to {email}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Time remaining: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
              </Text>
              <HStack justify="center">
                <PinInput otp value={otp} onChange={setOtp}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <PinInputField key={index} />
                  ))}
                </PinInput>
              </HStack>
              <Button
                colorScheme="blue"
                width="full"
                onClick={verifyOtpAndRegister}
                isLoading={otpLoading}
                fontFamily="'Segoe UI', sans-serif"
              >
                Verify Code & Create Account
              </Button>
              <Button
                variant="link"
                onClick={sendOtp}
                isDisabled={otpTimer > 0}
                fontFamily="'Segoe UI', sans-serif"
              >
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend Code'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Footer />
    </Flex>
  );
}