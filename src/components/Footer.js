import {
  Box,
  Text,
  Link as ChakraLink,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Stack,
  Grid,
  GridItem,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaHome,
  FaInfoCircle,
  FaPhone,
  FaFax,
  FaMapMarkerAlt,
  FaEnvelope,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaCertificate,
  FaSignInAlt,
  FaGlobe,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
export default function Footer() {
  const bgGradient = "linear(to-r, blue.700, purple.800)";
  const textColor = "white";
  const linkHoverColor = useColorModeValue("blue.200", "blue.300");
  const iconColor = useColorModeValue("teal.300", "teal.400");
  const borderColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.200");

  return (
    <Box
      bgGradient={bgGradient}
      color={textColor}
      py={10}
      px={{ base: 5, md: 10 }}
      borderTop="4px solid"
      borderTopColor="blue.400"
      fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    >
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} textAlign="left">
        {/* About Section */}
        <VStack align="start" spacing={4}>
          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            letterSpacing="wide"
            textTransform="uppercase"
            borderBottom="2px solid"
            borderBottomColor="teal.300"
            pb={2}
          >
            Info Tech Corporation Of Goa Ltd.
          </Text>
          <Text fontSize="md" opacity={0.9} lineHeight="tall" fontStyle="italic">
            Empowering students through high-quality internship opportunities and 
            bridging the gap between academia and industry.
          </Text>
        </VStack>

        {/* Quick Links */}
        <VStack align="start" spacing={4}>
          <Text 
            fontSize="lg" 
            fontWeight="bold" 
            letterSpacing="wide"
            textTransform="uppercase"
            borderBottom="2px solid"
            borderBottomColor="teal.300"
            pb={2}
          >
            Quick Links
          </Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            {[
              { label: "Home", icon: FaHome, href: "/" },
              { label: "About Us", icon: FaInfoCircle, href: "/about" },
              { label: "Download Certificate", icon: FaCertificate, href: "/download-certificate" },
              { label: "Official Site", icon: FaGlobe, href: "https://infotech.goa.gov.in", isExternal: true },
              { label: "Login", icon: FaSignInAlt, href: "/login" },
            ].map((item) => (
              <GridItem key={item.label}>
                <HStack spacing={3} align="center">
                  <Icon as={item.icon} boxSize={5} color={iconColor} />
                  <ChakraLink 
                    href={item.href} 
                    fontSize="md" 
                    isExternal={item.isExternal}
                    fontWeight="500"
                    _hover={{ 
                      color: linkHoverColor, 
                      textDecoration: "none",
                      transform: "translateX(5px)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {item.label}
                  </ChakraLink>
                </HStack>
              </GridItem>
            ))}
          </Grid>
        </VStack>

        {/* Contact Information */}
        <VStack align="start" spacing={4}>
          <Text 
            fontSize="lg" 
            fontWeight="bold" 
            letterSpacing="wide"
            textTransform="uppercase"
            borderBottom="2px solid"
            borderBottomColor="teal.300"
            pb={2}
          >
            Contact Us
          </Text>
          
          <HStack align="start" spacing={3}>
            <Icon as={FaMapMarkerAlt} boxSize={5} mt={1} color={iconColor} />
            <VStack align="start" spacing={0}>
              <Text fontSize="md" opacity={0.9} fontWeight="500">
                IT HUB, 3rd Floor, Altinho,
              </Text>
              <Text fontSize="md" opacity={0.9} fontWeight="500">
                Panaji-Goa 403 001
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={3}>
            <Icon as={FaPhone} boxSize={5} color={iconColor} />
            <Text fontSize="md" opacity={0.9} fontWeight="500">
              +91 (832) 2226024
            </Text>
          </HStack>
          
          <HStack spacing={3}>
            <Icon as={FaFax} boxSize={5} color={iconColor} />
            <Text fontSize="md" opacity={0.9} fontWeight="500">
              +91 (832) 2225192
            </Text>
          </HStack>
          
          <HStack spacing={3}>
            <Icon as={FaEnvelope} boxSize={5} color={iconColor} />
            <ChakraLink 
              href="mailto:itggoa.helpdesk@gmail.com" 
              fontSize="md" 
              opacity={0.9}
              fontWeight="500"
              _hover={{ 
                color: linkHoverColor, 
                textDecoration: "none",
              }}
            >
              itggoa.helpdesk@gmail.com
            </ChakraLink>
          </HStack>
        </VStack>
      </SimpleGrid>

      {/* Social Media Links */}
      <HStack 
        spacing={8} 
        justify="center" 
        mt={12}
        pt={8}
        borderTop="2px" 
        borderTopColor={borderColor}
      >
        {[
          { icon: FaFacebook, href: "https://www.facebook.com/itggoa/", label: "Facebook" },
          { icon: FaXTwitter, href: "https://x.com/itg_goa?lang=en", label: "Twitter" },
          { icon: FaLinkedin, href: "https://www.linkedin.com/company/info-tech-corporation-of-goa-limited/?originalSubdomain=in", label: "LinkedIn" },
          { icon: FaEnvelope, href: "mailto:itggoa.helpdesk@gmail.com", label: "Email" },
        ].map((social, index) => (
          <Box key={index}>
            <ChakraLink 
              href={social.href} 
              isExternal 
              _hover={{ 
                color: linkHoverColor,
                transform: "translateY(-5px)",
                transition: "all 0.3s ease"
              }}
              aria-label={social.label}
            >
              <Icon as={social.icon} boxSize={6} />
            </ChakraLink>
          </Box>
        ))}
      </HStack>

      {/* Footer Bottom */}
      <Stack 
        mt={8}
        direction={{ base: "column", md: "row" }} 
        justify="space-between" 
        align="center"
        fontSize="md" 
        opacity={0.9}
        spacing={4}
        pt={6}
        borderTop="2px" 
        borderTopColor={borderColor}
      >
        <Text fontWeight="bold" fontStyle="italic">
          © {new Date().getFullYear()} Info Tech Corporation of Goa Ltd. All rights reserved.
        </Text>
        <Text fontStyle="italic" color="teal.300" fontWeight="bold">
          Digital Transformation Initiative
        </Text>
      </Stack>
    </Box>
  );
}