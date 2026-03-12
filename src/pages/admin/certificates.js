import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
  useToast,
  Flex,
  Icon,
  Avatar,
  Card,
  CardBody,
  VStack,
  Spinner,
  HStack,
  Input,
  Select,
  SimpleGrid,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tag,
  Tooltip,
  Center,
  Grid,
  GridItem,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  keyframes,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Wrap,
  WrapItem,
  Link,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  FormControl,
  FormLabel,
  Textarea,
  InputGroup,
  InputLeftElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaEnvelope,
  FaBuilding,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUserGraduate,
  FaIdCard,
  FaPhone,
  FaCalendarCheck,
  FaChartLine,
  FaUniversity,
  FaChalkboardTeacher,
  FaUsers,
  FaInfoCircle,
  FaEye,
  FaStar,
  FaDownload,
  FaSync,
  FaChartBar,
  FaHistory,
  FaUserCircle,
  FaLinkedin,
  FaGithub,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt,
  FaAward,
  FaFilePdf,
  FaUserCheck,
  FaClipboardCheck,
  FaRegFileAlt,
  FaRobot,
  FaUserTie,
  FaGraduationCap,
  FaBriefcase,
  FaIdBadge,
  FaUpload,
  FaPlus,
  FaFileUpload,
  FaCertificate,
  FaShieldCheck,
  FaQrcode,
  FaEdit,
  FaTrash,
  FaBell,
  FaComments,
  FaCheck,
  FaReply,
} from "react-icons/fa";

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

export default function AdminCertificates() {
  const router = useRouter();
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minimumLoading, setMinimumLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [selectedCorrection, setSelectedCorrection] = useState(null);

  // Modal states
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isCorrectionsOpen, onOpen: onCorrectionsOpen, onClose: onCorrectionsClose } = useDisclosure();
  const { isOpen: isCorrectionDetailsOpen, onOpen: onCorrectionDetailsOpen, onClose: onCorrectionDetailsClose } = useDisclosure();

  // Form states
  const [formData, setFormData] = useState({
    student_id: "",
    program_name: "ITG Internship Program",
    issue_date: new Date().toISOString().split('T')[0],
    duration: "",
    domain: "",
  });
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updateSelectedFile, setUpdateSelectedFile] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  const cardBg = useColorModeValue("white", "gray.700");
  const accentColor = useColorModeValue("purple.500", "purple.400");
  const subtleBg = useColorModeValue("purple.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerGradient = useColorModeValue("linear(to-r, purple.500, purple.600)", "linear(to-r, purple.600, purple.700)");

  // Fetch certificates
  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/certificates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates || []);
      } else {
        throw new Error("Failed to fetch certificates");
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast({
        title: "❌ Oops! Certificate Fetch Failed",
        description: "We couldn't fetch your certificates. Please try again!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setMinimumLoading(false);
    }
  }, [toast, statusFilter, searchTerm]);

  // Fetch correction requests
  const fetchCorrectionRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/correction-requests');
      if (response.ok) {
        const data = await response.json();
        setCorrectionRequests(data.correctionRequests || []);
      } else {
        throw new Error("Failed to fetch correction requests");
      }
    } catch (error) {
      console.error("Error fetching correction requests:", error);
      toast({
        title: "❌ Failed to Load Correction Requests",
        description: "We couldn't fetch the correction requests. Please try again!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Fetch students who have completed internships
  const fetchCompletedStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);
      const response = await fetch('/api/admin/students-completed');
      if (response.ok) {
        const data = await response.json();
        
        // Filter out students who already have certificates
        const studentsWithoutCertificates = data.students.filter(student => 
          !certificates.some(cert => cert.student_id === student.student_id)
        );
        
        setStudents(studentsWithoutCertificates || []);
        
        // Show toast if no students found
        if (studentsWithoutCertificates.length === 0) {
          toast({
            title: "🎓 All Set!",
            description: "All completed interns already have their shiny certificates! 🎉",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        throw new Error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "🚨 Student Data Unavailable",
        description: "We're having trouble loading the intern data. Please refresh!",
        status: "error",
        duration: 3000,
      });
    } finally {
      setStudentsLoading(false);
    }
  }, [certificates, toast]);

  const refreshData = () => {
    setRefreshing(true);
    fetchCertificates();
    fetchCorrectionRequests();
    toast({
      title: "🔄 Refreshing Data",
      description: "Fetching the latest certificate information...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  useEffect(() => {
    const loadData = async () => {
      const minimumLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
      await Promise.all([
        fetchCertificates(),
        fetchCorrectionRequests(),
        minimumLoadTime
      ]);
    };
    
    loadData();
  }, [fetchCertificates, fetchCorrectionRequests]);

  // Load students when create modal opens
  useEffect(() => {
    if (isCreateOpen) {
      fetchCompletedStudents();
    }
  }, [isCreateOpen, fetchCompletedStudents]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'green';
      case 'issued': return 'purple';
      case 'correction_requested': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return FaCheckCircle;
      case 'issued': return FaCertificate;
      case 'correction_requested': return FaExclamationTriangle;
      default: return FaFilePdf;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Fix date for display in forms (handle timezone issues)
  const formatDateForInput = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
      
      // Adjust for timezone offset to get the correct date
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
      return adjustedDate.toISOString().split('T')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Check if form is valid for certificate creation
  const isFormValid = () => {
    return (
      selectedStudent &&
      formData.program_name.trim() !== "" &&
      formData.issue_date &&
      formData.duration.trim() !== "" &&
      selectedFile // PDF is now required
    );
  };

  // View certificate details
  const viewCertificateDetails = async (certificate) => {
    try {
      const response = await fetch(`/api/admin/certificates/${certificate.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCertificate(data.certificate);
        onDetailsOpen();
      } else {
        throw new Error("Failed to fetch certificate details");
      }
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      toast({
        title: "🔍 Details Unavailable",
        description: "Couldn't load certificate details. Please try again!",
        status: "error",
        duration: 2000,
      });
    }
  };

  // Open update modal
  const openUpdateModal = async (certificate) => {
    try {
      const response = await fetch(`/api/admin/certificates/${certificate.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCertificate(data.certificate);
        setFormData({
          student_id: data.certificate.student_id,
          program_name: data.certificate.program_name,
          issue_date: formatDateForInput(data.certificate.issue_date),
          duration: data.certificate.duration,
          domain: data.certificate.domain || "",
        });
        setUpdateSelectedFile(null);
        onUpdateOpen();
      } else {
        throw new Error("Failed to fetch certificate details");
      }
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      toast({
        title: "🔍 Details Unavailable",
        description: "Couldn't load certificate details. Please try again!",
        status: "error",
        duration: 2000,
      });
    }
  };

  // Open delete confirmation
  const openDeleteModal = (certificate) => {
    setSelectedCertificate(certificate);
    onDeleteOpen();
  };

  // View correction requests
  const viewCorrectionRequests = () => {
    onCorrectionsOpen();
  };

  // View correction details
  const viewCorrectionDetails = async (correction) => {
    try {
      const response = await fetch(`/api/admin/correction-requests/${correction.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCorrection(data.correctionRequest);
        onCorrectionDetailsOpen();
      } else {
        throw new Error("Failed to fetch correction details");
      }
    } catch (error) {
      console.error("Error fetching correction details:", error);
      toast({
        title: "🔍 Correction Details Unavailable",
        description: "Couldn't load correction details. Please try again!",
        status: "error",
        duration: 2000,
      });
    }
  };

  // Update certificate
  const handleUpdateCertificate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      let filePath = selectedCertificate.file_path;

      // If a new file is selected, upload it first
      if (updateSelectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', updateSelectedFile);
        uploadFormData.append('student_id', formData.student_id);

        const uploadResponse = await fetch('/api/admin/certificates/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          filePath = uploadData.filePath;
        } else {
          throw new Error("Failed to upload file");
        }
      }

      // Update certificate data - set status to 'issued' if it was 'correction_requested'
      const newStatus = selectedCertificate.status === 'correction_requested' ? 'issued' : selectedCertificate.status;
      
      const response = await fetch(`/api/admin/certificates/${selectedCertificate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          program_name: formData.program_name,
          issue_date: formData.issue_date,
          duration: formData.duration,
          domain: formData.domain,
          file_path: filePath,
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast({
          title: "✅ Certificate Updated!",
          description: "The certificate has been successfully updated! 🎓",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onUpdateClose();
        refreshData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update certificate");
      }
    } catch (error) {
      console.error("Error updating certificate:", error);
      toast({
        title: "❌ Update Failed",
        description: "We couldn't update the certificate. Please try again!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  // Delete certificate
  const handleDeleteCertificate = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/certificates/${selectedCertificate.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "🗑️ Certificate Deleted",
          description: "The certificate has been permanently removed from the system.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
        refreshData();
        setSelectedCertificate(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete certificate");
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast({
        title: "❌ Deletion Failed",
        description: "We couldn't delete the certificate. Please try again!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Select student for certificate creation
  const selectStudent = (student) => {
    setSelectedStudent(student);
    
    // Auto-populate duration from student data
    const duration = student.duration_months ? `${student.duration_months} months` : "2 months";
    
    // Auto-populate domain from student data (using areas_of_interest)
    const domain = student.areas_of_interest ? 
      (Array.isArray(student.areas_of_interest) ? 
        student.areas_of_interest.join(', ') : 
        student.areas_of_interest) : 
      "";
    
    setFormData({
      student_id: student.student_id,
      program_name: "ITG Internship Program",
      issue_date: new Date().toISOString().split('T')[0],
      duration: duration,
      domain: domain,
    });
  };

  // Create certificate
  const handleCreateCertificate = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "📝 Incomplete Form",
        description: "Please fill all required fields including the PDF upload! 📄",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);

    try {
      const response = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "🎉 Certificate Created!",
          description: "Your certificate has been issued successfully! 🎓",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Upload certificate file (now required)
        await uploadCertificateFile(data.certificate.id, selectedFile, formData.student_id);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to issue certificate");
      }
    } catch (error) {
      console.error("Error creating certificate:", error);
      toast({
        title: "❌ Certificate Creation Failed",
        description: "We couldn't create the certificate. Please try again!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  // Upload certificate file
  const uploadCertificateFile = async (certificateId, file, studentId) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('student_id', studentId);

    try {
      const response = await fetch('/api/admin/certificates/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const uploadData = await response.json();
        
        // Update certificate with file path
        const updateResponse = await fetch(`/api/admin/certificates/${certificateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_path: uploadData.filePath
          }),
        });

        if (updateResponse.ok) {
          toast({
            title: "📄 PDF Uploaded!",
            description: "Certificate PDF has been successfully attached! ✅",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onCreateClose();
          refreshData();
          resetForm();
        }
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "❌ PDF Upload Failed",
        description: "We couldn't upload the certificate PDF. Please try again!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle file selection for create
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      toast({
        title: "📄 PDF Selected!",
        description: "Certificate PDF ready for upload!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: "❌ Invalid File",
        description: "Please select a valid PDF file for the certificate",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      event.target.value = ''; // Reset file input
    }
  };

  // Handle file selection for update
  const handleUpdateFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUpdateSelectedFile(file);
      toast({
        title: "📄 New PDF Selected!",
        description: "New certificate PDF ready for upload!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: "❌ Invalid File",
        description: "Please select a valid PDF file for the certificate",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      event.target.value = ''; // Reset file input
    }
  };

  // View certificate PDF
  const viewCertificatePDF = (filePath) => {
    if (filePath) {
      window.open(filePath, '_blank');
    } else {
      toast({
        title: "❌ PDF Not Available",
        description: "No certificate PDF found for this record.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Mark correction as resolved (without sending message to mentor)
  const handleMarkCorrectionResolved = async (correction) => {
    try {
      const response = await fetch(`/api/admin/correction-requests/${correction.id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_notes: "Correction reviewed and certificate updated by admin",
          status: 'resolved'
        }),
      });

      if (response.ok) {
        toast({
          title: "✅ Correction Marked Resolved!",
          description: "The correction request has been marked as resolved.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onCorrectionDetailsClose();
        refreshData();
        setSelectedCorrection(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark correction as resolved");
      }
    } catch (error) {
      console.error("Error marking correction as resolved:", error);
      toast({
        title: "❌ Operation Failed",
        description: "We couldn't mark the correction as resolved. Please try again!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      student_id: "",
      program_name: "ITG Internship Program",
      issue_date: new Date().toISOString().split('T')[0],
      duration: "",
      domain: "",
    });
    setSelectedStudent(null);
    setSelectedFile(null);
  };

  // Calculate stats - UPDATED LOGIC: Verified certificates are also counted as issued
  const stats = {
    total: certificates.length,
    // Issued count now includes both 'issued' and 'verified' certificates
    issued: certificates.filter(c => c.status === 'issued' || c.status === 'verified').length,
    verified: certificates.filter(c => c.status === 'verified').length,
    correctionRequested: certificates.filter(c => c.status === 'correction_requested').length,
    pendingCorrections: correctionRequests.filter(cr => cr.status === 'pending').length,
  };

  // Enhanced loading component
  if (minimumLoading || (loading && !refreshing)) {
    return (
      <Box minH="100vh" bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            p={6}
            borderRadius="2xl"
            bgGradient={headerGradient}
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaCertificate} boxSize={10} />
          </Box>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
          <Text fontWeight="medium" fontSize="lg" color="black">
            Loading Certificate Management...
          </Text>
          <Text fontSize="sm" color="gray.500">Gathering certificate data</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, purple.50, pink.50)" fontFamily="'Segoe UI', sans-serif" py={4}>
      <Container maxW="8xl" px={4}>
        {/* Header with Back Button and Actions */}
        <Flex justify="space-between" align="center" mb={6}>
          <Button
            leftIcon={<FaArrowLeft />}
            colorScheme="purple"
            variant="outline"
            size="md"
            onClick={() => router.push("/admin/dashboard")}
            _hover={{ 
              bg: "purple.50",
              transform: "translateX(-4px)",
              transition: "transform 0.2s"
            }}
            borderRadius="xl"
            fontWeight="600"
          >
            Back to Dashboard
          </Button>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<FaSync />}
              colorScheme="purple"
              variant="outline"
              size="md"
              onClick={refreshData}
              isLoading={refreshing}
              borderRadius="xl"
              fontWeight="600"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="purple"
              size="md"
              onClick={onCreateOpen}
              borderRadius="xl"
              fontWeight="600"
              bgGradient={headerGradient}
              _hover={{ bgGradient: headerGradient }}
            >
              Issue Certificate
            </Button>
          </HStack>
        </Flex>

        {/* Main Header */}
        <Card 
          mb={6} 
          borderRadius="2xl" 
          boxShadow="xl" 
          bg={cardBg}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100px"
            bgGradient={headerGradient}
            opacity="0.1"
          />
          <CardBody py={8}>
            <VStack spacing={4} textAlign="center" position="relative" zIndex={1}>
              <Box
                w={20}
                h={20}
                bgGradient={headerGradient}
                borderRadius="2xl"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="lg"
                animation={`${float} 3s ease-in-out infinite`}
                mb={4}
              >
                <Icon as={FaCertificate} boxSize={8} />
              </Box>
              <Heading size="xl" fontWeight="700" textAlign="center">
                <Text as="span" mr={2}>📜</Text>
                <Text
                  as="span"
                  bgGradient={headerGradient}
                  bgClip="text"
                > 
                  Certificate Management
                </Text>
              </Heading>
              <Text color="gray.600" fontSize="lg" fontWeight="500" maxW="2xl">
                Issue and manage internship completion certificates
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Stats - Adjusted for 4 cards with proper spacing */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
          {[
            { 
              label: "Total Certificates", 
              value: stats.total, 
              color: "purple", 
              icon: FaCertificate,
              gradient: "linear(to-r, purple.500, pink.500)"
            },
            { 
              label: "Issued", 
              value: stats.issued, 
              color: "purple", 
              icon: FaCertificate,
              gradient: "linear(to-r, purple.500, purple.600)",
              description: "Includes verified certificates"
            },
            { 
              label: "Verified", 
              value: stats.verified, 
              color: "green", 
              icon: FaCheckCircle,
              gradient: "linear(to-r, green.500, teal.500)"
            },
            { 
              label: "Correction Requests", 
              value: stats.pendingCorrections, 
              color: "orange", 
              icon: FaExclamationTriangle,
              gradient: "linear(to-r, orange.500, red.500)"
            },
          ].map((stat, index) => (
            <Card 
              key={index} 
              bg={cardBg} 
              borderRadius="xl" 
              boxShadow="lg"
              _hover={{ transform: "translateY(-4px)", transition: "transform 0.2s" }}
              transition="transform 0.2s"
              flex="1"
              minW="0"
            >
              <CardBody py={5}>
                <Flex align="center" justify="space-between">
                  <Box flex="1" minW="0">
                    <Text fontSize="sm" color="gray.600" fontWeight="600" mb={1} noOfLines={1}>
                      {stat.label}
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" bgGradient={stat.gradient} bgClip="text">
                      {stat.value}
                    </Text>
                    {stat.description && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {stat.description}
                      </Text>
                    )}
                  </Box>
                  <Box 
                    p={3} 
                    borderRadius="xl" 
                    bgGradient={stat.gradient}
                    color="white"
                    boxShadow="md"
                    flexShrink={0}
                    ml={3}
                  >
                    <Icon as={stat.icon} boxSize={5} />
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Correction Requests Alert */}
        {stats.pendingCorrections > 0 && (
          <Card bg="orange.50" border="1px solid" borderColor="orange.200" mb={6} borderRadius="2xl">
            <CardBody py={4}>
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Icon as={FaExclamationTriangle} color="orange.500" boxSize={6} mr={3} />
                  <Box>
                    <Text fontWeight="bold" color="orange.700" fontSize="lg">
                      {stats.pendingCorrections} Pending Correction Request{stats.pendingCorrections !== 1 ? 's' : ''}
                    </Text>
                    <Text color="orange.600" fontSize="sm">
                      Review correction requests and update certificates as needed
                    </Text>
                  </Box>
                </Flex>
                <Button
                  leftIcon={<FaComments />}
                  colorScheme="orange"
                  onClick={viewCorrectionRequests}
                  borderRadius="xl"
                  fontWeight="600"
                >
                  View Requests
                </Button>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Controls Section */}
        <Card bg={cardBg} mb={6} borderRadius="2xl" boxShadow="lg">
          <CardBody py={5}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
              <Box>
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  🔍 Search Certificates
                </Text>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Student name, email, or certificate ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="md"
                    borderRadius="xl"
                    borderColor="gray.300"
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  />
                </InputGroup>
              </Box>
              
              <Box>
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  📊 Filter by Status
                </Text>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="md"
                  borderRadius="xl"
                  borderColor="gray.300"
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                >
                  <option value="all">All Status</option>
                  <option value="issued">Issued</option>
                  <option value="verified">Verified</option>
                  <option value="correction_requested">Correction Requested</option>
                </Select>
              </Box>
              
              <Box>
                <Text fontSize="md" fontWeight="600" mb={2} color="gray.600">
                  Actions
                </Text>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<FaFilter />}
                    colorScheme="purple"
                    variant="outline"
                    size="md"
                    flex="1"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    borderRadius="xl"
                    fontWeight="600"
                  >
                    Clear Filters
                  </Button>
                  {stats.pendingCorrections > 0 && (
                    <Button
                      leftIcon={<FaBell />}
                      colorScheme="orange"
                      variant="solid"
                      size="md"
                      flex="1"
                      onClick={viewCorrectionRequests}
                      borderRadius="xl"
                      fontWeight="600"
                    >
                      Corrections ({stats.pendingCorrections})
                    </Button>
                  )}
                </HStack>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Certificates Table */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="lg" overflow="hidden">
          <Box 
            bgGradient={headerGradient} 
            px={6} 
            py={4} 
            borderTopRadius="2xl"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="200px"
              h="200px"
              bg="white"
              opacity="0.1"
              borderRadius="full"
              transform="translate(100px, -100px)"
            />
            <Flex justify="space-between" align="center" position="relative" zIndex={1}>
              <Heading size="lg" color="white" fontWeight="700">
                📋 Certificate Records
              </Heading>
              <Badge 
                bg="white" 
                color="purple.600" 
                fontSize="md" 
                px={4} 
                py={2} 
                borderRadius="full" 
                fontWeight="700"
                boxShadow="md"
              >
                {certificates.length} Certificates
              </Badge>
            </Flex>
          </Box>
          
          <Box overflowX="auto" p={6}>
            <Table variant="simple" size="lg" colorScheme="purple">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Student Information</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Program Details</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Certificate Info</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Status</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Dates</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={6} px={4}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {certificates.map((certificate) => {
                  const StatusIcon = getStatusIcon(certificate.status);
                  const statusColor = getStatusColor(certificate.status);
                  
                  return (
                    <Tr 
                      key={certificate.id} 
                      _hover={{ bg: "gray.50", transform: "translateY(-2px)" }} 
                      transition="all 0.3s ease-in-out"
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      <Td py={5} px={4}>
                        <Flex align="center">
                          <Avatar
                            size="lg"
                            name={certificate.student_name}
                            src={certificate.profile_photo}
                            mr={4}
                            border="3px solid"
                            borderColor={`${statusColor}.300`}
                            boxShadow="lg"
                          />
                          <Box flex="1">
                            <Text fontWeight="bold" fontSize="lg" color="purple.900" mb={1}>
                              {certificate.student_name}
                            </Text>
                            <Text fontSize="sm" color="gray.600" fontWeight="500" mb={1}>
                              {certificate.student_email}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Student ID: {certificate.student_id} • {certificate.college} • {certificate.branch}
                            </Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td py={5} px={4}>
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="600" color="gray.800" fontSize="md">
                            {certificate.program_name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Duration: {certificate.duration}
                          </Text>
                          {certificate.domain && (
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              Domain: {certificate.domain}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td py={5} px={4}>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" color="gray.600" fontWeight="500">
                            Certificate ID: {certificate.certificate_id}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Verification ID: {certificate.verification_id}
                          </Text>
                          {certificate.file_path && (
                            <Badge colorScheme="green" fontSize="xs">
                              PDF Attached
                            </Badge>
                          )}
                        </VStack>
                      </Td>
                      <Td py={5} px={4}>
                        <Badge
                          colorScheme={statusColor}
                          display="flex"
                          alignItems="center"
                          px={3}
                          py={2}
                          borderRadius="full"
                          fontSize="md"
                          fontWeight="700"
                          w="fit-content"
                        >
                          <Icon as={StatusIcon} mr={2} boxSize={4} />
                          {certificate.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </Td>
                      <Td py={5} px={4}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600">
                            <strong>Issued:</strong> {formatDate(certificate.issue_date)}
                          </Text>
                          {certificate.verified_at && (
                            <Text fontSize="sm" color="gray.600">
                              <strong>Verified:</strong> {formatDate(certificate.verified_at)}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td py={5} px={4}>
                        <HStack spacing={3}>
                          <Tooltip label="View Certificate PDF" hasArrow>
                            <IconButton
                              aria-label="View Certificate"
                              icon={<FaEye />}
                              colorScheme="blue"
                              variant="outline"
                              size="md"
                              onClick={() => viewCertificatePDF(certificate.file_path)}
                              isDisabled={!certificate.file_path}
                              borderRadius="lg"
                            />
                          </Tooltip>
                          <Tooltip label="View Details" hasArrow>
                            <Button
                              size="md"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<FaEye />}
                              onClick={() => viewCertificateDetails(certificate)}
                              borderRadius="lg"
                              fontWeight="600"
                            >
                              View
                            </Button>
                          </Tooltip>
                          <Tooltip label="Update Certificate" hasArrow>
                            <Button
                              size="md"
                              colorScheme="purple"
                              variant="outline"
                              leftIcon={<FaEdit />}
                              onClick={() => openUpdateModal(certificate)}
                              borderRadius="lg"
                              fontWeight="600"
                            >
                              Update
                            </Button>
                          </Tooltip>
                          <Tooltip label="Delete Certificate" hasArrow>
                            <Button
                              size="md"
                              colorScheme="red"
                              variant="outline"
                              leftIcon={<FaTrash />}
                              onClick={() => openDeleteModal(certificate)}
                              borderRadius="lg"
                              fontWeight="600"
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>

          {certificates.length === 0 && (
            <Center py={16}>
              <VStack spacing={6}>
                <Box
                  w={24}
                  h={24}
                  bg="purple.100"
                  borderRadius="2xl"
                  color="purple.500"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="lg"
                >
                  <Icon as={FaCertificate} boxSize={10} />
                </Box>
                <Text color="gray.500" fontSize="lg" fontWeight="600">No certificates found</Text>
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    colorScheme="purple"
                    size="md"
                    borderRadius="xl"
                    fontWeight="600"
                    leftIcon={<FaSync />}
                  >
                    Clear Filters
                  </Button>
                )}
              </VStack>
            </Center>
          )}
        </Card>
      </Container>

      {/* Certificate Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" fontFamily="'Segoe UI', sans-serif">
          {selectedCertificate && (
            <>
              <ModalHeader 
                bgGradient={headerGradient} 
                color="white" 
                borderTopRadius="2xl" 
                py={6}
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="200px"
                  h="200px"
                  bg="white"
                  opacity="0.1"
                  borderRadius="full"
                  transform="translate(100px, -100px)"
                />
                <Flex align="center" position="relative" zIndex={1}>
                  <Avatar
                    size="lg"
                    name={selectedCertificate.student_name}
                    src={selectedCertificate.profile_photo}
                    mr={4}
                    border="3px solid white"
                    boxShadow="lg"
                  />
                  <Box flex="1">
                    <Heading size="lg" fontWeight="700">{selectedCertificate.student_name}</Heading>
                    <Text fontSize="md" opacity={0.9}>
                      {selectedCertificate.program_name} • {selectedCertificate.college}
                    </Text>
                  </Box>
                </Flex>
              </ModalHeader>
              <ModalCloseButton color="white" size="lg" />
              
              <ModalBody p={6}>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="600" color="gray.600" mb={2}>Certificate Information</Text>
                      <VStack align="start" spacing={2}>
                        <Text><strong>Certificate ID:</strong> {selectedCertificate.certificate_id}</Text>
                        <Text><strong>Verification ID:</strong> {selectedCertificate.verification_id}</Text>
                        <Text><strong>Program:</strong> {selectedCertificate.program_name}</Text>
                        <Text><strong>Duration:</strong> {selectedCertificate.duration}</Text>
                      </VStack>
                    </Box>

                    <Box>
                      <Text fontWeight="600" color="gray.600" mb={2}>Student Information</Text>
                      <VStack align="start" spacing={2}>
                        <Text><strong>Name:</strong> {selectedCertificate.student_name}</Text>
                        <Text><strong>Student ID:</strong> {selectedCertificate.student_id}</Text>
                        <Text><strong>Email:</strong> {selectedCertificate.student_email}</Text>
                        <Text><strong>College:</strong> {selectedCertificate.college}</Text>
                        <Text><strong>Branch:</strong> {selectedCertificate.branch}</Text>
                      </VStack>
                    </Box>
                  </VStack>

                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="600" color="gray.600" mb={2}>Dates</Text>
                      <VStack align="start" spacing={2}>
                        <Text><strong>Issue Date:</strong> {formatDate(selectedCertificate.issue_date)}</Text>
                        {selectedCertificate.verified_at && (
                          <Text><strong>Verified At:</strong> {formatDate(selectedCertificate.verified_at)}</Text>
                        )}
                      </VStack>
                    </Box>

                    <Box>
                      <Text fontWeight="600" color="gray.600" mb={2}>Status & Verification</Text>
                      <VStack align="start" spacing={2}>
                        <Badge
                          colorScheme={getStatusColor(selectedCertificate.status)}
                          fontSize="md"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {selectedCertificate.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {selectedCertificate.issued_by_name && (
                          <Text><strong>Issued By:</strong> {selectedCertificate.issued_by_name}</Text>
                        )}
                        {selectedCertificate.verified_by_name && (
                          <Text><strong>Verified By:</strong> {selectedCertificate.verified_by_name}</Text>
                        )}
                      </VStack>
                    </Box>

                    {selectedCertificate.domain && (
                      <Box>
                        <Text fontWeight="600" color="gray.600" mb={2}>Domain</Text>
                        <Text>{selectedCertificate.domain}</Text>
                      </Box>
                    )}
                  </VStack>
                </Grid>

                {selectedCertificate.file_path && (
                  <Box mt={6} p={4} bg="purple.50" borderRadius="xl">
                    <Flex align="center" justify="space-between">
                      <Flex align="center">
                        <Icon as={FaFilePdf} color="red.500" boxSize={6} mr={3} />
                        <Box>
                          <Text fontWeight="600" color="gray.700">Certificate PDF</Text>
                          <Text fontSize="sm" color="gray.600">
                            File: Internship_Certificate_{selectedCertificate.student_id}.pdf
                          </Text>
                        </Box>
                      </Flex>
                      <Button
                        leftIcon={<FaDownload />}
                        colorScheme="purple"
                        onClick={() => window.open(selectedCertificate.file_path, '_blank')}
                      >
                        View PDF
                      </Button>
                    </Flex>
                  </Box>
                )}
              </ModalBody>
              
              <ModalFooter>
                <Button
                  variant="outline"
                  onClick={onDetailsClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Create Certificate Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" maxH="90vh" overflow="hidden">
          <ModalHeader 
            bgGradient={headerGradient} 
            color="white" 
            borderTopRadius="2xl"
            py={6}
          >
            <Heading size="lg" fontWeight="700">Issue New Certificate</Heading>
            <Text fontSize="sm" opacity={0.9} mt={2}>
              Select a student with completed internship status
            </Text>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" onClick={() => {
            onCreateClose();
            resetForm();
          }} />
          
          <ModalBody py={6} overflowY="auto">
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              {/* Student Selection Panel */}
              <Box>
                <Text fontWeight="bold" color="gray.700" mb={4} fontSize="lg">
                  Select Student (Completed Internships)
                </Text>
                <Box 
                  border="1px solid" 
                  borderColor="gray.200" 
                  borderRadius="xl" 
                  maxH="400px" 
                  overflowY="auto"
                  bg="gray.50"
                >
                  {studentsLoading ? (
                    <Center py={8}>
                      <VStack spacing={3}>
                        <Spinner size="lg" color="purple.500" />
                        <Text color="gray.600">Loading students with completed internships...</Text>
                      </VStack>
                    </Center>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <Box
                        key={student.student_id}
                        p={4}
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        cursor="pointer"
                        bg={selectedStudent?.student_id === student.student_id ? "purple.50" : "white"}
                        _hover={{ bg: "purple.50" }}
                        onClick={() => selectStudent(student)}
                      >
                        <Flex align="center">
                          <Avatar
                            size="md"
                            name={student.name}
                            src={student.profile_photo}
                            mr={3}
                          />
                          <Box flex="1">
                            <Text fontWeight="600" color="gray.800">
                              {student.name}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {student.student_id} • {student.college}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {student.branch} • {student.duration_months || 2} months
                            </Text>
                            {student.areas_of_interest && (
                              <Text fontSize="xs" color="blue.600" mt={1}>
                                Domain: {Array.isArray(student.areas_of_interest) ? 
                                  student.areas_of_interest.join(', ') : 
                                  student.areas_of_interest}
                              </Text>
                            )}
                          </Box>
                          {selectedStudent?.student_id === student.student_id && (
                            <Icon as={FaCheckCircle} color="purple.500" />
                          )}
                        </Flex>
                      </Box>
                    ))
                  ) : (
                    <Center py={8}>
                      <VStack spacing={3}>
                        <Icon as={FaUserGraduate} color="gray.400" boxSize={8} />
                        <Text color="gray.600">No students available for certificate issuance</Text>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          All students with completed internships already have certificates or no students found
                        </Text>
                      </VStack>
                    </Center>
                  )}
                </Box>
              </Box>

              {/* Certificate Details Panel */}
              <Box>
                <Text fontWeight="bold" color="gray.700" mb={4} fontSize="lg">
                  Certificate Details
                </Text>
                <form onSubmit={handleCreateCertificate}>
                  <VStack spacing={4}>
                    {selectedStudent && (
                      <Box w="full" p={4} bg="purple.50" borderRadius="xl">
                        <Text fontWeight="600" color="purple.700" mb={2}>
                          ✅ Selected Student
                        </Text>
                        <Text fontSize="sm" color="purple.600">
                          {selectedStudent.name} ({selectedStudent.student_id})
                        </Text>
                        <Text fontSize="sm" color="purple.600">
                          {selectedStudent.college} • {selectedStudent.branch}
                        </Text>
                        <Text fontSize="sm" color="purple.600">
                          Duration: {selectedStudent.duration_months || 2} months
                        </Text>
                      </Box>
                    )}

                    <FormControl isRequired>
                      <FormLabel fontWeight="600">Program Name</FormLabel>
                      <Input
                        value={formData.program_name}
                        onChange={(e) => setFormData({...formData, program_name: e.target.value})}
                        placeholder="Enter program name"
                        borderRadius="xl"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="600">Issue Date</FormLabel>
                      <Input
                        type="date"
                        value={formData.issue_date}
                        onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                        borderRadius="xl"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="600">Duration</FormLabel>
                      <Input
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="Duration"
                        borderRadius="xl"
                        isReadOnly={!!selectedStudent}
                        bg={selectedStudent ? "gray.50" : "white"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="600">Domain</FormLabel>
                      <Textarea
                        value={formData.domain}
                        onChange={(e) => setFormData({...formData, domain: e.target.value})}
                        placeholder="Domain/areas of interest"
                        borderRadius="xl"
                        rows={3}
                        bg={selectedStudent && formData.domain ? "gray.50" : "white"}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="600">
                        📄 Upload Certificate PDF (Required)
                      </FormLabel>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        borderRadius="xl"
                        py={2}
                        required
                      />
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        File will be saved as: Internship_Certificate_{selectedStudent?.student_id || 'student_id'}.pdf
                      </Text>
                      {selectedFile && (
                        <Text fontSize="sm" color="green.600" mt={1} fontWeight="600">
                          ✅ PDF file selected and ready for upload!
                        </Text>
                      )}
                    </FormControl>
                  </VStack>
                </form>
              </Box>
            </Grid>
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={() => {
                  onCreateClose();
                  resetForm();
                }}
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleCreateCertificate}
                isLoading={uploading}
                isDisabled={!isFormValid()}
                leftIcon={<FaCertificate />}
                borderRadius="xl"
                bgGradient={headerGradient}
                _hover={{ bgGradient: headerGradient }}
              >
                Issue Certificate
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Update Certificate Modal */}
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader 
            bgGradient={headerGradient} 
            color="white" 
            borderTopRadius="2xl"
            py={6}
          >
            <Heading size="lg" fontWeight="700">Update Certificate</Heading>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" />
          
          <ModalBody py={6}>
            {selectedCertificate && (
              <>
                {/* Current Certificate PDF View */}
                {selectedCertificate.file_path && (
                  <Box mb={6} p={4} bg="purple.50" borderRadius="xl">
                    <Flex align="center" justify="space-between">
                      <Flex align="center">
                        <Icon as={FaFilePdf} color="red.500" boxSize={6} mr={3} />
                        <Box>
                          <Text fontWeight="600" color="gray.700">Current Certificate PDF</Text>
                          <Text fontSize="sm" color="gray.600">
                            File: Internship_Certificate_{selectedCertificate.student_id}.pdf
                          </Text>
                        </Box>
                      </Flex>
                      <HStack spacing={2}>
                        <Tooltip label="View Current Certificate" hasArrow>
                          <IconButton
                            aria-label="View Current Certificate"
                            icon={<FaEye />}
                            colorScheme="blue"
                            variant="outline"
                            size="sm"
                            onClick={() => viewCertificatePDF(selectedCertificate.file_path)}
                          />
                        </Tooltip>
                      </HStack>
                    </Flex>
                  </Box>
                )}

                <form onSubmit={handleUpdateCertificate}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="600">Program Name</FormLabel>
                      <Input
                        value={formData.program_name}
                        onChange={(e) => setFormData({...formData, program_name: e.target.value})}
                        placeholder="Enter program name"
                        borderRadius="xl"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="600">Issue Date</FormLabel>
                      <Input
                        type="date"
                        value={formData.issue_date}
                        onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                        borderRadius="xl"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="600">Duration</FormLabel>
                      <Input
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="Enter duration"
                        borderRadius="xl"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="600">Domain</FormLabel>
                      <Textarea
                        value={formData.domain}
                        onChange={(e) => setFormData({...formData, domain: e.target.value})}
                        placeholder="Domain/areas of interest"
                        borderRadius="xl"
                        rows={3}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="600">
                        📄 Replace Certificate PDF (Optional)
                      </FormLabel>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleUpdateFileSelect}
                        borderRadius="xl"
                        py={2}
                      />
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        Upload a new PDF to replace the current certificate file
                      </Text>
                      {updateSelectedFile && (
                        <Text fontSize="sm" color="green.600" mt={1} fontWeight="600">
                          ✅ New PDF file selected and ready for upload!
                        </Text>
                      )}
                    </FormControl>
                  </VStack>
                </form>
              </>
            )}
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={onUpdateClose}
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleUpdateCertificate}
                isLoading={updating}
                leftIcon={<FaEdit />}
                borderRadius="xl"
                bgGradient={headerGradient}
                _hover={{ bgGradient: headerGradient }}
              >
                Update Certificate
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Certificate Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={undefined}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" bg="red.500" color="white" borderTopRadius="2xl" py={4}>
              <Flex align="center">
                <Icon as={FaExclamationTriangle} mr={3} />
                Delete Certificate
              </Flex>
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              <VStack spacing={4} align="start">
                <Text fontWeight="600">
                  Are you sure you want to delete this certificate?
                </Text>
                {selectedCertificate && (
                  <Box p={4} bg="red.50" borderRadius="xl" w="full">
                    <Text fontSize="sm" color="red.700">
                      <strong>Student:</strong> {selectedCertificate.student_name}
                    </Text>
                    <Text fontSize="sm" color="red.700">
                      <strong>Certificate ID:</strong> {selectedCertificate.certificate_id}
                    </Text>
                    <Text fontSize="sm" color="red.700">
                      <strong>Program:</strong> {selectedCertificate.program_name}
                    </Text>
                  </Box>
                )}
                <Text fontSize="sm" color="gray.600">
                  This action cannot be undone. All certificate data will be permanently deleted.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <HStack spacing={3}>
                <Button
                  ref={undefined}
                  onClick={onDeleteClose}
                  variant="outline"
                  borderRadius="xl"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteCertificate}
                  isLoading={deleting}
                  leftIcon={<FaTrash />}
                  borderRadius="xl"
                >
                  Delete Certificate
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Correction Requests Modal */}
      <Modal isOpen={isCorrectionsOpen} onClose={onCorrectionsClose} size="6xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" maxH="90vh">
          <ModalHeader 
            bgGradient="linear(to-r, orange.500, orange.600)" 
            color="white" 
            borderTopRadius="2xl"
            py={6}
            pr={16}
          >
            <Flex align="center" justify="space-between">
              <Flex align="center">
                <Icon as={FaComments} mr={3} />
                <Heading size="lg" fontWeight="700">Correction Requests</Heading>
              </Flex>
              <Badge bg="white" color="orange.600" fontSize="md" px={3} py={1} borderRadius="full">
                {correctionRequests.length} Requests
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" />
          
          <ModalBody py={6} overflowY="auto">
            <Table variant="simple" size="lg">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={4}>Student & Certificate</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={4}>Mentor</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={4}>Message</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={4}>Status</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={4}>Date</Th>
                  <Th fontSize="lg" fontWeight="700" color="gray.700" py={4}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {correctionRequests.map((request) => (
                  <Tr key={request.id} _hover={{ bg: "gray.50" }}>
                    <Td py={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="600" color="gray.800">
                          {request.student_name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {request.student_id}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Certificate ID: {request.certificate_number}
                        </Text>
                      </VStack>
                    </Td>
                    <Td py={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="600" color="gray.800">
                          {request.mentor_name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Mentor ID: {request.mentor_id}
                        </Text>
                      </VStack>
                    </Td>
                    <Td py={4}>
                      <Text fontSize="sm" color="gray.700" noOfLines={3}>
                        {request.message}
                      </Text>
                    </Td>
                    <Td py={4}>
                      <Badge
                        colorScheme={request.status === 'pending' ? 'orange' : 'green'}
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {request.status.toUpperCase()}
                      </Badge>
                    </Td>
                    <Td py={4}>
                      <Text fontSize="sm" color="gray.600">
                        {formatDate(request.created_at)}
                      </Text>
                    </Td>
                    <Td py={4}>
                      <HStack spacing={2}>
                        <Tooltip label="View Details" hasArrow>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<FaEye />}
                            onClick={() => viewCorrectionDetails(request)}
                            borderRadius="lg"
                          >
                            View
                          </Button>
                        </Tooltip>
                        {request.status === 'pending' && (
                          <Tooltip label="Mark as Resolved" hasArrow>
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<FaCheck />}
                              onClick={() => handleMarkCorrectionResolved(request)}
                              borderRadius="lg"
                            >
                              Mark Resolved
                            </Button>
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {correctionRequests.length === 0 && (
              <Center py={16}>
                <VStack spacing={6}>
                  <Box
                    w={20}
                    h={20}
                    bg="orange.100"
                    borderRadius="2xl"
                    color="orange.500"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="lg"
                  >
                    <Icon as={FaCheckCircle} boxSize={8} />
                  </Box>
                  <Text color="gray.500" fontSize="lg" fontWeight="600">
                    No pending correction requests
                  </Text>
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    All correction requests have been resolved! 🎉
                  </Text>
                </VStack>
              </Center>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button
              variant="outline"
              onClick={onCorrectionsClose}
              borderRadius="xl"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Correction Details Modal */}
      <Modal isOpen={isCorrectionDetailsOpen} onClose={onCorrectionDetailsClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader 
            bgGradient="linear(to-r, blue.500, blue.600)" 
            color="white" 
            borderTopRadius="2xl"
            py={6}
          >
            <Flex align="center">
              <Icon as={FaInfoCircle} mr={3} />
              <Heading size="lg" fontWeight="700">Correction Request Details</Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" />
          
          <ModalBody py={6}>
            {selectedCorrection && (
              <VStack spacing={6} align="start">
                <Box p={4} bg="blue.50" borderRadius="xl" w="full">
                  <Text fontWeight="600" color="blue.700" mb={2}>
                    Student & Certificate Information
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    <strong>Student:</strong> {selectedCorrection.student_name}
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    <strong>Student ID:</strong> {selectedCorrection.student_id}
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    <strong>Certificate Number:</strong> {selectedCorrection.certificate_number}
                  </Text>
                </Box>

                <Box p={4} bg="green.50" borderRadius="xl" w="full">
                  <Text fontWeight="600" color="green.700" mb={2}>
                    Mentor Information
                  </Text>
                  <Text fontSize="sm" color="green.700">
                    <strong>Mentor:</strong> {selectedCorrection.mentor_name}
                  </Text>
                  <Text fontSize="sm" color="green.700">
                    <strong>Mentor ID:</strong> {selectedCorrection.mentor_id}
                  </Text>
                  <Text fontSize="sm" color="green.700">
                    <strong>Requested On:</strong> {formatDate(selectedCorrection.created_at)}
                  </Text>
                </Box>

                <Box p={4} bg="orange.50" borderRadius="xl" w="full">
                  <Text fontWeight="600" color="orange.700" mb={2}>
                    Correction Message
                  </Text>
                  <Text fontSize="sm" color="orange.700" whiteSpace="pre-wrap">
                    {selectedCorrection.message}
                  </Text>
                </Box>

                {selectedCorrection.admin_notes && (
                  <Box p={4} bg="purple.50" borderRadius="xl" w="full">
                    <Text fontWeight="600" color="purple.700" mb={2}>
                      Admin Response
                    </Text>
                    <Text fontSize="sm" color="purple.700" whiteSpace="pre-wrap">
                      {selectedCorrection.admin_notes}
                    </Text>
                    {selectedCorrection.resolved_at && (
                      <Text fontSize="sm" color="purple.700" mt={2}>
                        <strong>Resolved On:</strong> {formatDate(selectedCorrection.resolved_at)}
                      </Text>
                    )}
                  </Box>
                )}

                {selectedCorrection.status === 'pending' && (
                  <Box p={4} bg="yellow.50" borderRadius="xl" w="full">
                    <Text fontSize="sm" color="yellow.700" fontWeight="600">
                      ⚠️ This request is pending resolution
                    </Text>
                    <Text fontSize="sm" color="yellow.700" mt={2}>
                      You can update the certificate and mark this as resolved.
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3}>
              {selectedCorrection?.status === 'pending' && (
                <Button
                  colorScheme="green"
                  leftIcon={<FaCheck />}
                  onClick={() => handleMarkCorrectionResolved(selectedCorrection)}
                  borderRadius="xl"
                >
                  Mark as Resolved
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCorrectionDetailsClose}
                borderRadius="xl"
              >
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}