import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Heading,
  Text,
  useToast,
  VStack,
  IconButton,
  Container,
  Alert,
  AlertIcon,
  Progress,
  HStack,
  List,
  ListItem,
  ListIcon,
  keyframes,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, LockIcon, CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

// Animation for floating elements
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export default function ResetPassword() {
  const router = useRouter();
  const toast = useToast();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showInterestingToast = (title, description, status, emoji, duration = 3000) => {
    const configs = {
      error: {
        bg: "red.50",
        borderColor: "red.200",
        icon: "❌",
        gradient: "linear(to-r, red.100, orange.100)"
      },
      success: {
        bg: "green.50",
        borderColor: "green.200",
        icon: "🎉",
        gradient: "linear(to-r, green.100, teal.100)"
      },
      info: {
        bg: "blue.50",
        borderColor: "blue.200",
        icon: "💡",
        gradient: "linear(to-r, blue.100, purple.100)"
      },
      warning: {
        bg: "orange.50",
        borderColor: "orange.200",
        icon: "⚠️",
        gradient: "linear(to-r, orange.100, yellow.100)"
      }
    };

    const config = configs[status] || configs.info;

    toast({
      title: (
        <HStack>
          <Text fontSize="lg">{config.icon}</Text>
          <Text fontWeight="bold">{title}</Text>
          <Text fontSize="lg">{emoji}</Text>
        </HStack>
      ),
      description: (
        <Text fontSize="sm" color="white">
          {description}
        </Text>
      ),
      status,
      duration,
      position: "top-right",
      isClosable: true,
      containerStyle: {
        bg: config.bg,
        border: "2px solid",
        borderColor: config.borderColor,
        borderRadius: "xl",
        boxShadow: "xl",
        background: config.gradient,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      showInterestingToast(
        "Oops! Missing Fields", 
        "Please fill in both password fields to continue", 
        "error", 
        "🔍"
      );
      return;
    }

    if (!validatePassword(password)) {
      showInterestingToast(
        "Password Needs More Power! 💪", 
        "Your password must meet all security requirements below", 
        "warning", 
        "🛡️"
      );
      return;
    }

    if (password !== confirmPassword) {
      showInterestingToast(
        "Password Mismatch!", 
        "The passwords don't match. Please check and try again", 
        "error", 
        "🔀"
      );
      return;
    }

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast({
      title: (
        <HStack>
          <Text animation={`${spin} 1s linear infinite`}>⚡</Text>
          <Text fontWeight="bold">Securing Your Account...</Text>
        </HStack>
      ),
      description: "We're encrypting your new password",
      status: "info",
      duration: null, // Persistent
      position: "top-right",
      containerStyle: {
        bg: "blue.50",
        border: "2px solid",
        borderColor: "blue.200",
        borderRadius: "xl",
        background: "linear(to-r, blue.100, purple.100)",
      },
    });

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      // Close loading toast
      toast.close(loadingToast);

      if (!res.ok) {
        showInterestingToast(
          "Reset Failed 🚫", 
          data.error || "Something went wrong. Please try again", 
          "error", 
          "😔"
        );
      } else {
        showInterestingToast(
          "Password Reset Success! 🎊", 
          "Your password has been updated securely. Redirecting to login...", 
          "success", 
          "🔒"
        );
        
        // Show celebration sequence
        setTimeout(() => {
          showInterestingToast(
            "Welcome Back! 🚀", 
            "Your account is now more secure than ever!", 
            "success", 
            "🌟",
            2000
          );
        }, 1000);

        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (err) {
      toast.close(loadingToast);
      showInterestingToast(
        "Connection Issue 🌐", 
        "Unable to connect. Please check your internet and try again", 
        "error", 
        "📡"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasMinLength = pwd.length >= 8;
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && hasMinLength;
  };

  const getPasswordRequirements = (pwd) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const requirements = getPasswordRequirements(password);
  const allRequirementsMet = Object.values(requirements).every(Boolean);

  const getPasswordStrength = (pwd) => {
    const reqs = getPasswordRequirements(pwd);
    const metCount = Object.values(reqs).filter(Boolean).length;
    const totalCount = Object.values(reqs).length;
    
    const strength = (metCount / totalCount) * 100;
    
    if (strength <= 20) return { strength, color: "red.400", label: "Very Weak" };
    if (strength <= 40) return { strength, color: "orange.400", label: "Weak" };
    if (strength <= 60) return { strength, color: "yellow.400", label: "Fair" };
    if (strength <= 80) return { strength, color: "blue.400", label: "Good" };
    return { strength, color: "purple.500", label: "Strong" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <Flex 
      minH="100vh" 
      align="center" 
      justify="center" 
      bgGradient="linear(to-br, blue.50, purple.50)"
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Animated Background Elements */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        w="200px"
        h="200px"
        bg="blue.100"
        borderRadius="full"
        opacity="0.4"
        filter="blur(40px)"
        animation={`${float} 6s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="15%"
        right="15%"
        w="150px"
        h="150px"
        bg="purple.100"
        borderRadius="full"
        opacity="0.4"
        filter="blur(40px)"
        animation={`${float} 4s ease-in-out infinite 1s`}
      />
      <Box
        position="absolute"
        top="20%"
        right="20%"
        w="100px"
        h="100px"
        bg="blue.200"
        borderRadius="full"
        opacity="0.3"
        filter="blur(30px)"
        animation={`${float} 5s ease-in-out infinite 0.5s`}
      />
      <Box
        position="absolute"
        bottom="25%"
        left="15%"
        w="120px"
        h="120px"
        bg="purple.200"
        borderRadius="full"
        opacity="0.3"
        filter="blur(30px)"
        animation={`${float} 7s ease-in-out infinite 1.5s`}
      />

      <Container maxW="md" centerContent>
        <VStack spacing={8} w="full">
          {/* Header Section */}
          <VStack textAlign="center" spacing={4}>
            <Box
              p={4}
              bgGradient="linear(to-r, blue.500, purple.500)"
              borderRadius="full"
              color="white"
              boxShadow="xl"
              transform={allRequirementsMet ? "scale(1.1)" : "scale(1)"}
              transition="all 0.3s ease"
              animation={`${pulse} 2s ease-in-out infinite`}
            >
              <LockIcon boxSize={6} />
            </Box>
            <Heading size="xl" fontWeight="bold" bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">
              Create New Password
            </Heading>
            <Text color="gray.600" fontSize="lg" textAlign="center">
              Secure your account with a powerful new password
            </Text>
          </VStack>

          {/* Form Section */}
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            w="100%"
            border="1px"
            borderColor="gray.100"
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              bgGradient: "linear(to-r, blue.500, purple.500)",
              borderTopRadius: "2xl",
            }}
          >
            <Alert status="info" mb={6} borderRadius="lg" fontSize="sm" bg="blue.50" borderColor="blue.200">
              <AlertIcon color="blue.500" />
              <Box>
                <Text fontWeight="bold" color="blue.700">Password Requirements:</Text>
                <Text fontSize="xs" color="blue.600">Must include 8+ characters with uppercase, lowercase, number, and symbol</Text>
              </Box>
            </Alert>

            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* New Password Field */}
                <FormControl>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    New Password 🔒
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create your super password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                      pr="4.5rem"
                      focusBorderColor="blue.500"
                      borderRadius="lg"
                      borderColor={password ? (allRequirementsMet ? "blue.300" : "orange.300") : "gray.300"}
                    />
                    <InputRightElement width="4.5rem" h="full">
                      <IconButton
                        h="1.75rem"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        bg="transparent"
                        _hover={{ bg: "gray.100" }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      />
                    </InputRightElement>
                  </InputGroup>
                  
                  {/* Password Strength Meter */}
                  {password && (
                    <VStack spacing={3} mt={4} align="start">
                      <Box w="100%">
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.600">
                            Password Strength:
                          </Text>
                          <Text fontSize="xs" fontWeight="bold" color={passwordStrength.color}>
                            {passwordStrength.label}
                          </Text>
                        </HStack>
                        <Progress 
                          value={passwordStrength.strength} 
                          colorScheme={
                            passwordStrength.label === "Strong" ? "purple" :
                            passwordStrength.label === "Good" ? "blue" :
                            passwordStrength.label === "Fair" ? "yellow" :
                            passwordStrength.label === "Weak" ? "orange" : "red"
                          }
                          size="sm" 
                          borderRadius="full"
                          bg="gray.200"
                        />
                      </Box>
                      
                      {/* Requirements Checklist */}
                      <List spacing={1} fontSize="xs" w="100%">
                        <ListItem color={requirements.length ? "blue.500" : "gray.500"}>
                          <ListIcon as={requirements.length ? CheckCircleIcon : WarningIcon} />
                          At least 8 characters
                        </ListItem>
                        <ListItem color={requirements.uppercase ? "blue.500" : "gray.500"}>
                          <ListIcon as={requirements.uppercase ? CheckCircleIcon : WarningIcon} />
                          One uppercase letter (A-Z)
                        </ListItem>
                        <ListItem color={requirements.lowercase ? "blue.500" : "gray.500"}>
                          <ListIcon as={requirements.lowercase ? CheckCircleIcon : WarningIcon} />
                          One lowercase letter (a-z)
                        </ListItem>
                        <ListItem color={requirements.number ? "blue.500" : "gray.500"}>
                          <ListIcon as={requirements.number ? CheckCircleIcon : WarningIcon} />
                          One number (0-9)
                        </ListItem>
                        <ListItem color={requirements.special ? "blue.500" : "gray.500"}>
                          <ListIcon as={requirements.special ? CheckCircleIcon : WarningIcon} />
                          One special character (!@#$%^&*)
                        </ListItem>
                      </List>
                    </VStack>
                  )}
                </FormControl>

                {/* Confirm Password Field */}
                <FormControl>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Confirm Password ✅
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      size="lg"
                      pr="4.5rem"
                      focusBorderColor="blue.500"
                      borderRadius="lg"
                      borderColor={confirmPassword ? (password === confirmPassword ? "blue.300" : "red.300") : "gray.300"}
                    />
                    <InputRightElement width="4.5rem" h="full">
                      <IconButton
                        h="1.75rem"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        bg="transparent"
                        _hover={{ bg: "gray.100" }}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {confirmPassword && (
                    <Text 
                      fontSize="sm" 
                      fontWeight="bold"
                      color={password === confirmPassword ? "blue.500" : "red.500"} 
                      mt={2}
                    >
                      {password === confirmPassword ? "🎉 Passwords match perfectly!" : "❌ Passwords don't match"}
                    </Text>
                  )}
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  isLoading={isLoading}
                  loadingText="Securing Your Account..."
                  bgGradient={allRequirementsMet && password === confirmPassword ? 
                    "linear(to-r, blue.500, purple.500)" : 
                    "linear(to-r, blue.400, purple.400)"}
                  _hover={{
                    bgGradient: allRequirementsMet && password === confirmPassword ?
                      "linear(to-r, blue.600, purple.600)" :
                      "linear(to-r, blue.500, purple.500)",
                    transform: "translateY(-2px)",
                    shadow: "xl",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.3s ease"
                  borderRadius="xl"
                  fontWeight="bold"
                  fontSize="md"
                  py={7}
                  isDisabled={!password || !confirmPassword || password !== confirmPassword || !allRequirementsMet}
                  boxShadow="lg"
                >
                  {allRequirementsMet && password === confirmPassword ? 
                    "Reset Password 🔐" : 
                    "Reset Password"}
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Security Celebration */}
          {allRequirementsMet && password === confirmPassword && (
            <Box
              p={4}
              bgGradient="linear(to-r, blue.50, purple.50)"
              border="1px"
              borderColor="blue.200"
              borderRadius="lg"
              textAlign="center"
              animation={`${pulse} 2s ease-in-out infinite`}
            >
              <Text fontSize="sm" color="blue.700" fontWeight="bold">
                🎊 Excellent! Your password is fortress-strong! 🎊
              </Text>
            </Box>
          )}

          {/* Fun Security Facts */}
          <Box textAlign="center" maxW="sm">
            <Text fontSize="xs" color="blue.600" fontStyle="italic" fontWeight="medium">
              💡 Did you know? A strong password like yours would take hackers centuries to crack!
            </Text>
          </Box>
        </VStack>
      </Container>
    </Flex>
  );
}