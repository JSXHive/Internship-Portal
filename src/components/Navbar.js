import {
  Flex,
  Box,
  Link as ChakraLink,
  Button,
  Image,
  HStack,
  keyframes,
  useColorModeValue,
  Text,
  Icon
} from "@chakra-ui/react";
import {
  FaHome,
  FaInfoCircle,
  FaCertificate
} from "react-icons/fa";
import { FaArrowRightToBracket } from "react-icons/fa6";
import NextLink from "next/link";
import { motion } from "framer-motion";

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 3px rgba(255,255,255,0.7); }
  50% { box-shadow: 0 0 12px rgba(255,255,255,0.9); }
  100% { box-shadow: 0 0 3px rgba(255,255,255,0.7); }
`;

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHStack = motion(HStack);
const MotionText = motion(Text);

const Navbar = () => {
  const bgGradient = "linear(to-r, blue.600, purple.700)";
  const tabBg = "rgba(255, 255, 255, 0.15)";
  const hoverBg = "rgba(255, 255, 255, 0.25)";
  const textColor = "white";
  const accentColor = useColorModeValue("teal.300", "teal.400");

  const navItems = [
    { label: "Home", icon: FaHome, href: "/" },
    { label: "About Us", icon: FaInfoCircle, href: "/about" },
    { label: "Download Certificate", icon: FaCertificate, href: "/download-certificate" },
  ];

  return (
    <MotionBox
      bgGradient={bgGradient}
      color={textColor}
      px={6}
      py={3}
      boxShadow="lg"
      fontFamily="'Inter', sans-serif"
      position="sticky"
      top="0"
      zIndex="1000"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      borderBottom="2px solid"
      borderBottomColor="whiteAlpha.300"
    >
      {/* Animated background elements */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        background="linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.03) 100%)"
        backgroundSize="1000px 100%"
        animation={`${shimmer} 8s infinite linear`}
        opacity="0.5"
        zIndex="0"
      />
      
      <Flex align="center" justify="space-between" position="relative" zIndex="1">
        {/* Logo & Title */}
        <MotionHStack 
          spacing={3}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <MotionBox
            animation={`${pulse} 4s ease-in-out infinite`}
            whileHover={{ animation: "none", scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/logo.png"
              alt="ITG Logo"
              boxSize="45px"
              borderRadius="md"
              border="2px solid"
              borderColor="whiteAlpha.500"
              p={1}
              bg="whiteAlpha.200"
              animation={`${glow} 3s infinite`}
            />
          </MotionBox>
          <Box>
            <MotionText
              fontWeight="bold"
              fontSize="xl"
              letterSpacing="0.5px"
              color="white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              fontFamily="'Inter', sans-serif"
            >
              Info Tech Corporation Of Goa Internship Portal
            </MotionText>
            <MotionText
              fontSize="sm"
              opacity={0.9}
              mt={-0.5}
              letterSpacing="0.5px"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              fontFamily="'Inter', sans-serif"
              fontWeight="medium"
            >
              Digital Transformation Initiative
            </MotionText>
          </Box>
        </MotionHStack>

        {/* Navigation Links */}
        <HStack gap={2} align="center">
          {navItems.map((item, index) => (
            <MotionBox
              key={item.label}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ 
                y: -2,
                transition: { duration: 0.2 }
              }}
            >
              <NextLink href={item.href} passHref legacyBehavior>
                <ChakraLink
                  display="flex"
                  alignItems="center"
                  gap={1}
                  px={4}
                  py={2}
                  borderRadius="lg"
                  fontWeight="semibold"
                  fontSize="md"
                  bg={tabBg}
                  color={textColor}
                  transition="all 0.3s ease"
                  _hover={{
                    bg: hoverBg,
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                    textDecoration: "none",
                    _before: {
                      left: "100%"
                    }
                  }}
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transition: "0.5s"
                  }}
                >
                  <Icon as={item.icon} boxSize="16px" mr={1} />
                  {item.label}
                </ChakraLink>
              </NextLink>
            </MotionBox>
          ))}

          {/* Login Button */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            <NextLink href="/login" passHref legacyBehavior>
              <Button
                leftIcon={<FaArrowRightToBracket />}
                variant="solid"
                size="md"
                bgGradient="linear(to-r, teal.500, cyan.500)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, teal.600, cyan.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                  _before: {
                    transform: "translateX(100%)"
                  }
                }}
                _active={{
                  bgGradient: "linear(to-r, teal.700, cyan.700)",
                }}
                borderRadius="lg"
                px={6}
                fontWeight="bold"
                fontSize="md"
                py={4}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)",
                    transform: "translateX(-100%)",
                  transition: "transform 0.6s ease"
                }}
              >
                Login
              </Button>
            </NextLink>
          </MotionBox>
        </HStack>
      </Flex>
    </MotionBox>
  );
};

export default Navbar;