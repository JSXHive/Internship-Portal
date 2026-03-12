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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Image,
  Container,
  VStack,
  HStack,
  Card,
  CardBody,
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, RepeatIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Login() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Custom CAPTCHA state
  const [captchaValue, setCaptchaValue] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // Color values
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("blue.600", "blue.400");
  const accentLight = useColorModeValue("blue.500", "blue.300");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const subtleBg = useColorModeValue("blue.50", "blue.900");
  const errorColor = useColorModeValue("red.500", "red.300");

  // Toast colors
  const successBg = useColorModeValue("green.50", "green.900");
  const errorBg = useColorModeValue("red.50", "red.900");
  const successBorder = useColorModeValue("green.200", "green.600");
  const errorBorder = useColorModeValue("red.200", "red.600");
  const successText = useColorModeValue("green.800", "green.200");
  const errorText = useColorModeValue("red.800", "red.200");

  // Use useCallback to memoize the showCustomToast function
  const showCustomToast = useCallback((title, status, description = "") => {
    const isSuccess = status === "success";

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
        backgroundColor: isSuccess ? successBg : errorBg,
        border: `1px solid ${isSuccess ? successBorder : errorBorder}`,
        color: isSuccess ? successText : errorText,
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    });
  }, [toast, successBg, errorBg, successBorder, errorBorder, successText, errorText]);

  // Generate a simple math CAPTCHA
  const generateCaptcha = useCallback(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch(operator) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '*': answer = num1 * num2; break;
      default: answer = num1 + num2;
    }
    
    setCaptchaValue(answer.toString());
    return `${num1} ${operator} ${num2}`;
  }, []);

  const [captchaQuestion, setCaptchaQuestion] = useState("");

  // Initialize CAPTCHA on component mount
  useEffect(() => {
    setCaptchaQuestion(generateCaptcha());
  }, [generateCaptcha]);

  // Refresh CAPTCHA
  const refreshCaptcha = () => {
    setCaptchaQuestion(generateCaptcha());
    setUserCaptchaInput("");
    setCaptchaError("");
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // CAPTCHA validation
    if (!userCaptchaInput.trim()) {
      setCaptchaError("CAPTCHA answer is required");
    } else if (userCaptchaInput !== captchaValue) {
      setCaptchaError("Incorrect CAPTCHA answer");
    } else {
      setCaptchaError("");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && userCaptchaInput === captchaValue;
  };

  // Show toast for each error
  const showValidationToasts = useCallback((errors) => {
    Object.keys(errors).forEach((field) => {
      showCustomToast("Validation Error", "error", errors[field]);
    });
    
    if (captchaError) {
      showCustomToast("CAPTCHA Error", "error", captchaError);
    }
  }, [showCustomToast, captchaError]);

  // Enhanced browser navigation prevention
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e) => {
      window.history.pushState(null, '', window.location.href);
      showCustomToast(
        "Navigation Restricted",
        "error",
        "Please use the application's navigation system"
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showCustomToast]);

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      showValidationToasts(errors);
      return;
    }
    
    try {
      setIsLoading(true);
      // Static admin credentials
      const ADMIN_EMAIL = "admin@itg.com";
      const ADMIN_PASSWORD = "Admin@123";

      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const data = {
          role: "admin",
          userId: "admin",
          name: "Admin",
          email: ADMIN_EMAIL
        };
        
        // Show toast after a small delay to ensure loading state is visible
        setTimeout(() => {
          showCustomToast(
            "Admin Login Successful! 👑",
            "success",
            "Access granted to administrative dashboard"
          );
        }, 100);
        
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userRole", data.role);
        
        // Keep the loading state for the same duration as other users
        setTimeout(() => {
          router.push("/admin/dashboard");
          setIsLoading(false);
        }, 1500);
        return;
      }

      // Normal user login
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showCustomToast("Login failed", "error", data.error || "Account not found. Please sign up first.");
        setIsLoading(false);
        return;
      }

      // Show different success messages based on user role with name included
      if (data.role === "student") {
        showCustomToast(
          `Welcome Back, ${data.name}! 🎓`,
          "success",
          "Redirecting to your student dashboard..."
        );
      } else if (data.role === "mentor") {
        showCustomToast(
          `Welcome Back, ${data.name}! 🧑‍🏫`,
          "success",
          "Redirecting to your mentor dashboard..."
        );
      } else {
        showCustomToast(
          "Login Successful!!",
          "success",
          "Redirecting to your dashboard..."
        );
      }

      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userRole", data.role);

      setTimeout(() => {
        if (data.role === "student") {
          router.push("/student/dashboard");
        } else if (data.role === "mentor") {
          router.push("/mentor/dashboard");
        } else {
          router.push("/");
        }
        setIsLoading(false);
      }, 1500);

    } catch (err) {
      console.error("Login error:", err);
      showCustomToast("Error", "error", "Something went wrong. Please try again.");
      setIsLoading(false);
    } finally {
      // Refresh CAPTCHA after login attempt
      refreshCaptcha();
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      showCustomToast("Email required", "error", "Please enter your email address");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      showCustomToast("Invalid Email", "error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await res.json();

      if (!res.ok) {
        showCustomToast("Error", "error", data.error || "Something went wrong. Please try again.");
        return;
      }

      showCustomToast("Email Sent Successfully!", "success", "Check your email for password reset instructions");

      onClose();
      setForgotEmail("");

    } catch (err) {
      console.error("Forgot password error:", err);
      showCustomToast("Error", "error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex direction="column" minH="100vh" fontFamily="'Segoe UI', sans-serif">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
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
                onSubmit={handleLogin}
                noValidate // This disables browser validation
                autoComplete="off"
              >
                <VStack spacing={4} textAlign="center">
                  <Box position="relative" width="130px" height="130px" mx="auto" mb={2}>
                    {/* Background circle */}
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
                    
                    {/* Logo container with border */}
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
                  
                  <Heading as="h1" size="xl" fontWeight="bold" color={accentColor} letterSpacing="-0.5px" fontSize="32px">
                    Internship Portal
                  </Heading>
                  
                  <Text color={mutedText} fontSize="18px" fontWeight="medium" maxW="300px" mx="auto">
                    Sign in to manage your internship applications and progress
                  </Text>
                </VStack>

                <Divider borderColor={borderColor} />

                <Stack spacing={6}>
                  <FormControl isRequired isInvalid={errors.email}>
                    <FormLabel fontSize="18px" fontWeight="600" color="gray.700" mb={2}>
                      Email Address
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none" color="gray.500" height="100%">
                        <FaEnvelope size="18px" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          // Clear error when user starts typing
                          if (errors.email) {
                            setErrors({...errors, email: ""});
                          }
                        }}
                        placeholder="Enter your email address"
                        height="56px"
                        bg={inputBg}
                        borderColor={errors.email ? errorColor : borderColor}
                        fontSize="17px"
                        pl={12}
                        _hover={{ borderColor: errors.email ? errorColor : "gray.300" }}
                        _focus={{ 
                          borderColor: errors.email ? errorColor : accentColor, 
                          boxShadow: errors.email ? `0 0 0 2px ${errorColor}20` : `0 0 0 2px ${accentColor}20`,
                        }}
                        autoComplete="off"
                      />
                    </InputGroup>
                    {errors.email && (
                      <Text color={errorColor} fontSize="16px" mt={1}>
                        {errors.email}
                      </Text>
                    )}
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={errors.password}>
                    <FormLabel fontSize="18px" fontWeight="600" color="gray.700" mb={2}>
                      Password
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none" color="gray.500" height="100%">
                        <FaLock size="18px" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          // Clear error when user starts typing
                          if (errors.password) {
                            setErrors({...errors, password: ""});
                          }
                        }}
                        placeholder="Enter your password"
                        height="56px"
                        bg={inputBg}
                        borderColor={errors.password ? errorColor : borderColor}
                        fontSize="17px"
                        pl={12}
                        _hover={{ borderColor: errors.password ? errorColor : "gray.300" }}
                        _focus={{ 
                          borderColor: errors.password ? errorColor : accentColor, 
                          boxShadow: errors.password ? `0 0 0 2px ${errorColor}20` : `0 0 0 2px ${accentColor}20`,
                        }}
                        autoComplete="off"
                      />
                      <InputRightElement height="100%">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          variant="ghost"
                          size="md"
                          color="gray.500"
                          _hover={{ color: accentColor, bg: "transparent" }}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    {errors.password && (
                      <Text color={errorColor} fontSize="16px" mt={1}>
                        {errors.password}
                      </Text>
                    )}
                  </FormControl>

                  {/* Custom CAPTCHA Section */}
                  <FormControl isRequired>
                    <FormLabel fontSize="18px" fontWeight="600" color="gray.700" mb={2}>
                      CAPTCHA Verification
                    </FormLabel>
                    <VStack align="stretch" spacing={3} p={4} bg={subtleBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold" fontSize="18px">
                          Solve: {captchaQuestion} = ?
                        </Text>
                        <IconButton
                          aria-label="Refresh CAPTCHA"
                          icon={<RepeatIcon />}
                          size="sm"
                          onClick={refreshCaptcha}
                          variant="outline"
                        />
                      </Flex>
                      <Input
                        type="text"
                        value={userCaptchaInput}
                        onChange={(e) => setUserCaptchaInput(e.target.value)}
                        placeholder="Enter the answer"
                        size="lg"
                        height="50px"
                        bg={inputBg}
                        borderColor={captchaError ? errorColor : borderColor}
                        fontSize="17px"
                        _hover={{ borderColor: captchaError ? errorColor : "gray.300" }}
                        _focus={{ 
                          borderColor: captchaError ? errorColor : accentColor, 
                          boxShadow: captchaError ? `0 0 0 2px ${errorColor}20` : `0 0 0 2px ${accentColor}20`,
                        }}
                        autoComplete="off"
                      />
                      {captchaError && (
                        <Text color={errorColor} fontSize="16px">
                          {captchaError}
                        </Text>
                      )}
                    </VStack>
                  </FormControl>

                  <Flex justify="end" mt={-2}>
                    <Button 
                      variant="link" 
                      color={accentLight} 
                      onClick={onOpen}
                      fontSize="17px"
                      fontWeight="semibold"
                      _hover={{ textDecoration: "none", color: accentColor }}
                    >
                      Forgot your password?
                    </Button>
                  </Flex>

                  <Button 
                    colorScheme="blue" 
                    size="lg"
                    height="56px"
                    type="submit"
                    fontWeight="bold"
                    fontSize="18px"
                    mt={2}
                    isLoading={isLoading}
                    loadingText="Logging in..."
                    bgGradient="linear(to-r, blue.600, blue.500)"
                    _hover={{ 
                      transform: "translateY(-2px)", 
                      shadow: "lg",
                      bgGradient: "linear(to-r, blue.700, blue.600)"
                    }}
                    _active={{
                      bgGradient: "linear(to-r, blue.700, blue.600)"
                    }}
                    transition="all 0.2s"
                    borderRadius="12px"
                  >
                    Log In To Your Account
                  </Button>
                </Stack>

                <HStack justify="center" pt={4} spacing={2}>
                  <Text color={mutedText} fontSize="17px">
                    New to the portal?
                  </Text>
                  <Link href="/signup" passHref>
                    <Button 
                      variant="link" 
                      color={accentColor} 
                      fontWeight="bold" 
                      fontSize="17px"
                      _hover={{ textDecoration: "none", color: accentLight }}
                    >
                      Create Account
                    </Button>
                  </Link>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>

      {/* Forgot Password Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <Box 
            bgGradient="linear(to-r, blue.600, blue.500)" 
            height="8px" 
            width="100%"
            borderTopRadius="2xl"
          />
          <ModalHeader color="gray.700" fontWeight="bold" fontSize="22px" pt={6}>
            Reset Your Password
          </ModalHeader>
          <ModalCloseButton size="lg" />
          <ModalBody py={2}>
            <Text color="gray.600" mb={4} fontSize="17px">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </Text>
            <FormControl>
              <FormLabel fontSize="18px" fontWeight="600" color="gray.700">Email Address</FormLabel>
              <Input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Your email address"
                size="lg"
                height="50px"
                borderColor="gray.300"
                fontSize="17px"
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}20` }}
                autoComplete="off"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.200" pt={6}>
            <Button variant="outline" mr={3} onClick={onClose} size="md" borderRadius="10px" fontSize="16px">
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleForgotPassword}
              isLoading={isLoading}
              size="md"
              borderRadius="10px"
              fontSize="16px"
              bgGradient="linear(to-r, blue.600, blue.500)"
              _hover={{ bgGradient: "linear(to-r, blue.700, blue.600)" }}
            >
              Send Instructions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Footer */}
      <Footer />
    </Flex>
  );
}