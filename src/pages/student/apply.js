// pages/apply.js
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  useToast,
  Text,
  Fade,
  Radio,
  RadioGroup,
  Grid,
  GridItem,
  useColorModeValue,
  Card,
  CardBody,
  Icon,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
  Tooltip,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  AspectRatio,
  Flex,
  InputGroup,
  InputLeftElement,
  Spinner,
  Center,
  keyframes
} from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
  FaFilePdf, 
  FaCalendarAlt, 
  FaUserGraduate, 
  FaIdCard, 
  FaGraduationCap,
  FaBook,
  FaArrowLeft,
  FaCheckCircle,
  FaInfoCircle,
  FaEye,
  FaUpload,
  FaCloudUploadAlt,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaCodeBranch,
  FaCalendarDay,
  FaClock,
  FaStar,
  FaLaptopCode,
  FaBrain,
  FaMobileAlt,
  FaChartBar,
  FaShieldAlt,
  FaCloud,
  FaDatabase,
  FaPalette,
  FaMicrochip,
  FaNetworkWired,
  FaVial,
  FaHeart,
  FaFileAlt,
  FaRocket,
  FaPartyHorn,
  FaFire,
  FaThumbsUp,
  FaExclamationTriangle,
  FaCalendarTimes
} from 'react-icons/fa';

// ✅ Move toastConfigs outside the component to make it truly constant
const TOAST_CONFIGS = {
  success: {
    icon: FaRocket,
    bg: 'green.500',
    color: 'white',
    duration: 4000,
  },
  error: {
    icon: FaExclamationTriangle,
    bg: 'red.500',
    color: 'white',
    duration: 5000,
  },
  warning: {
    icon: FaCalendarTimes,
    bg: 'orange.500',
    color: 'white',
    duration: 4000,
  },
  info: {
    icon: FaInfoCircle,
    bg: 'blue.500',
    color: 'white',
    duration: 3000,
  }
};

// Pulse animation for loading state
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function ApplyPage() {
  const toast = useToast();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
    college: '',
    branch: '',
    yearOfStudy: '',
    cgpa: '',
    interest: '',
    duration: '',
    start_date: '',
    end_date: '',
    resume: null,
    resumeName: '',
    resumeUrl: '',
  });

  // Color scheme - all hooks called at top level
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryColor = useColorModeValue('purple.500', 'purple.300');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const radioHoverBg = useColorModeValue('gray.100', 'gray.600');
  const uploadHoverBg = useColorModeValue('blue.50', 'blue.900');
  const resumeBoxBg = useColorModeValue('blue.50', 'blue.900');
  const sectionBg = useColorModeValue('white', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.900');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const gradientBg = useColorModeValue('linear(to-r, blue.500, purple.500)', 'linear(to-r, blue.600, purple.600)');

  // ✅ FIXED: Define colors for interest icons at top level
  const webDevColor = useColorModeValue('blue.500', 'blue.300');
  const mlColor = useColorModeValue('purple.500', 'purple.300');
  const aiColor = useColorModeValue('pink.500', 'pink.300');
  const mobileColor = useColorModeValue('green.500', 'green.300');
  const dataColor = useColorModeValue('teal.500', 'teal.300');
  const securityColor = useColorModeValue('orange.500', 'orange.300');
  const cloudColor = useColorModeValue('cyan.500', 'cyan.300');
  const dbColor = useColorModeValue('yellow.500', 'yellow.300');
  const uiuxColor = useColorModeValue('red.500', 'red.300');
  const hardwareColor = useColorModeValue('gray.500', 'gray.300');
  const networkingColor = useColorModeValue('blue.700', 'blue.400');
  const testingColor = useColorModeValue('purple.700', 'purple.400');

  // ✅ FIXED: Now useMemo can safely reference the variables
  const interestColors = useMemo(() => ({
    'Web Development': webDevColor,
    'Machine Learning': mlColor,
    'Artificial Intelligence': aiColor,
    'Mobile App Development': mobileColor,
    'Data Analytics': dataColor,
    'Cybersecurity': securityColor,
    'Cloud Computing': cloudColor,
    'Database Management': dbColor,
    'UI/UX': uiuxColor,
    'Hardware Design': hardwareColor,
    'Networking': networkingColor,
    'Software Testing': testingColor,
  }), [webDevColor, mlColor, aiColor, mobileColor, dataColor, securityColor, cloudColor, dbColor, uiuxColor, hardwareColor, networkingColor, testingColor]);

  // ✅ Fixed: useCallback with stable dependencies
  const showToast = useCallback((type, title, description, options = {}) => {
    const config = TOAST_CONFIGS[type];
    toast({
      title,
      description,
      status: type,
      duration: options.duration || config.duration,
      isClosable: true,
      position: 'top-right',
      variant: 'solid',
      icon: <Icon as={config.icon} />,
      containerStyle: {
        borderRadius: 'lg',
        boxShadow: 'xl',
        border: '1px solid',
        borderColor: `${type}.200`,
      },
      ...options
    });
  }, [toast]); // ✅ Only toast as dependency since TOAST_CONFIGS is constant

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Check if a date is a weekend (Saturday or Sunday)
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Calculate progress percentage
  useEffect(() => {
    let filledFields = 0;
    const totalFields = 10; // Updated from 8 to 10 to include start_date and end_date
    
    if (form.name) filledFields++;
    if (form.email) filledFields++;
    if (form.contact) filledFields++;
    if (form.college) filledFields++;
    if (form.branch) filledFields++;
    if (form.yearOfStudy) filledFields++;
    if (form.cgpa) filledFields++;
    if (form.start_date) filledFields++;
    if (form.end_date) filledFields++;
    if (form.resume || form.resumeUrl) filledFields++;
    
    setProgress(Math.round((filledFields / totalFields) * 100));
  }, [form]);

  // Handle resume preview
  const handleResumePreview = () => {
    if (!form.resume && !form.resumeUrl) return;
    
    if (form.resume instanceof File) {
      const fileUrl = URL.createObjectURL(form.resume);
      setResumePreviewUrl(fileUrl);
    } else if (form.resumeUrl) {
      setResumePreviewUrl(form.resumeUrl);
    }
    
    onOpen();
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (resumePreviewUrl && resumePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  // ✅ Fetch user profile and application status
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // Simulate 2 seconds loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const raw = localStorage.getItem('user');
        if (!raw) {
          setIsLoading(false);
          return;
        }
        
        const parsed = JSON.parse(raw);
        if (!parsed?.email) {
          setIsLoading(false);
          return;
        }

        const email = parsed.email;
        setUserEmail(email);

        // Fetch user profile
        const profileRes = await fetch(`/api/getprofile?email=${encodeURIComponent(email)}`);
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileRes.json();

        // Fetch application status
        const appRes = await fetch(`/api/check-application?email=${encodeURIComponent(email)}`);
        let applicationData = null;
        let hasSubmitted = false;
        let applicationStatus = '';

        if (appRes.ok) {
          applicationData = await appRes.json();
          hasSubmitted = applicationData.exists;
          applicationStatus = applicationData.status || '';
          setHasSubmitted(hasSubmitted);
          setApplicationStatus(applicationStatus);
          
          // If user has already submitted, disable editing by default
          if (hasSubmitted) {
            setIsEditing(false);
          }
        }

        const updatedForm = {
          name: profileData.name || '',
          email: profileData.email || '',
          contact: profileData.phone || '',
          cgpa: profileData.cgpa || '',
          college: profileData.college || '',
          branch: profileData.branch || '',
          yearOfStudy: profileData.yearOfStudy || '',
          interest: profileData.interest || '',
          duration: profileData.duration || '',
          start_date: formatDateForInput(profileData.start_date) || '',
          end_date: formatDateForInput(profileData.end_date) || '',
          resumeName: profileData.resumeName || '',
          resume: null,
          resumeUrl: profileData.resumeUrl || '',
        };

        // If user has already submitted an application, load application data
        if (hasSubmitted && applicationData.application) {
          const app = applicationData.application;
          updatedForm.interest = app.interest || '';
          updatedForm.duration = app.duration || '';
          updatedForm.start_date = formatDateForInput(app.start_date) || '';
          updatedForm.end_date = formatDateForInput(app.end_date) || '';
          updatedForm.resumeName = app.resumeName || '';
          updatedForm.resumeUrl = app.resumeUrl || '';
        }

        setForm(updatedForm);
        setInitialForm(updatedForm);
        
        // Show welcome toast
        if (hasSubmitted) {
          showToast('success', 
            'Welcome Back! 🎉', 
            'Your application details are loaded and ready for review.'
          );
        } else {
          showToast('info', 
            'Ready to Apply! 📝', 
            'Complete your application to start your internship journey.'
          );
        }
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        showToast('error', 
          'Oops! Something went wrong 😅', 
          'We had trouble loading your application data. Please refresh the page.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'resume') {
      const file = files?.[0];
      if (file && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('error', 
          'Wrong File Type! 📄', 
          'We only accept PDF files for resumes. Please upload a PDF document.'
        );
        return;
      }
      setForm((prev) => ({
        ...prev,
        resume: file || null,
        resumeName: file?.name || prev.resumeName,
        resumeUrl: '', // Clear URL when new file is selected
      }));

      if (file) {
        showToast('success', 
          'Resume Uploaded! 📎', 
          'Your resume has been successfully attached to your application.'
        );
      }
      return;
    }

    if (name === 'contact') return; // Do NOT allow editing phone number

    // Validate weekend dates for start_date and end_date
    if ((name === 'start_date' || name === 'end_date') && value) {
      const selectedDate = new Date(value);
      if (isWeekend(selectedDate)) {
        showToast('warning', 
          'Weekends are for Relaxation! 🌴', 
          'Please select a weekday (Monday to Friday) for your internship dates.'
        );
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestChange = (value) => {
    setForm((prev) => ({ ...prev, interest: value }));
    
    // Show fun message when interest is selected
    if (value) {
      showToast('info', 
        'Great Choice! 💡', 
        `You've selected ${value} as your area of interest.`
      );
    }
  };

  const handleCancel = () => {
    if (initialForm) {
      setForm(initialForm);
    }
    setIsEditing(false);
    showToast('info', 
      'Changes Discarded 🔄', 
      'Your application has been restored to its previous state.'
    );
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        showToast('error', 
          'PDF Only Please! 📄', 
          'Drag & drop works only with PDF files. Please try again with a PDF.'
        );
        return;
      }
      setForm((prev) => ({
        ...prev,
        resume: file,
        resumeName: file.name,
        resumeUrl: '', // Clear URL when new file is selected
      }));
      showToast('success', 
        'Drop Successful! 🎯', 
        'Your resume has been dropped right into place!'
      );
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remove resume
  const handleRemoveResume = () => {
    setForm((prev) => ({
      ...prev,
      resume: null,
      resumeName: '',
      resumeUrl: '',
    }));
    showToast('info', 
      'Resume Removed 🗑️', 
      'Your resume has been removed. Remember to upload a new one before submitting!'
    );
  };

  // Validate form fields
  const validateForm = () => {
    // Check required fields with fun messages
    if (!form.name) {
      showToast('error', 
        'Who are you? 👤', 
        'We\'d love to know your name! Please provide your full name.'
      );
      return false;
    }

    if (!form.email) {
      showToast('error', 
        'Missing Connection! 📧', 
        'We need your email to stay in touch. Please provide your email address.'
      );
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showToast('error', 
        'Email Looks Funny! 🤔', 
        'That email address doesn\'t look quite right. Please check and try again.'
      );
      return false;
    }

    if (!form.contact) {
      showToast('error', 
        'Can\'t Call You! 📱', 
        'We need your contact number to reach out. Please provide your digits!'
      );
      return false;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.contact)) {
      showToast('error', 
        'Invalid Number! 🔢', 
        'Please provide a valid 10-digit phone number (no spaces or dashes).'
      );
      return false;
    }

    if (!form.college) {
      showToast('error', 
        'College Mystery! 🎓', 
        'Tell us about your college/university. We\'re curious!'
      );
      return false;
    }

    if (!form.branch) {
      showToast('error', 
        'What\'s Your Major? 📚', 
        'Please let us know your branch/department of study.'
      );
      return false;
    }

    if (!form.yearOfStudy) {
      showToast('error', 
        'Which Year? 📅', 
        'Help us understand where you are in your academic journey.'
      );
      return false;
    }

    if (!form.cgpa) {
      showToast('error', 
        'Grades Please! 📊', 
        'We\'d love to know your academic performance. Please provide your CGPA.'
      );
      return false;
    }

    // Validate CGPA range (0-10)
    const cgpa = parseFloat(form.cgpa);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      showToast('error', 
        'CGPA Out of This World! 🚀', 
        'CGPA must be a realistic number between 0 and 10.'
      );
      return false;
    }

    if (!form.interest) {
      showToast('error', 
        'What Excites You? 💫', 
        'Select one area that sparks your interest!'
      );
      return false;
    }

    if (!form.duration) {
      showToast('error', 
        'How Long? ⏳', 
        'Please let us know your preferred internship duration in months.'
      );
      return false;
    }

    const durationMonths = parseInt(form.duration, 10);
    if (isNaN(durationMonths) || durationMonths < 1 || durationMonths > 12) {
      showToast('error', 
        'Time Traveler? 🕰️', 
        'Internship duration should be between 1 and 12 months.'
      );
      return false;
    }

    // Make start_date and end_date required
    if (!form.start_date) {
      showToast('error', 
        'When Do We Start? 🗓️', 
        'Please provide a start date for your internship adventure.'
      );
      return false;
    }

    if (!form.end_date) {
      showToast('error', 
        'When\'s the Finish Line? 🏁', 
        'Please provide an end date for your internship journey.'
      );
      return false;
    }

    // Validate weekend dates
    const startDate = form.start_date ? new Date(form.start_date) : null;
    const endDate = form.end_date ? new Date(form.end_date) : null;

    if (startDate && isWeekend(startDate)) {
      showToast('warning', 
        'Weekend Start? 🌅', 
        'Internships start on weekdays. Please choose a Monday-Friday date.'
      );
      return false;
    }

    if (endDate && isWeekend(endDate)) {
      showToast('warning', 
        'Weekend Finish? 🌇', 
        'Internships end on weekdays. Please choose a Monday-Friday date.'
      );
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Allow today's date for start date
    if (startDate) {
      const adjustedToday = new Date();
      adjustedToday.setHours(0, 0, 0, 0);
      
      if (startDate < adjustedToday) {
        showToast('error', 
          'Time Machine Needed! ⏪', 
          'Start date cannot be in the past. Let\'s plan for the future!'
        );
        return false;
      }
    }

    if (endDate) {
      const adjustedToday = new Date();
      adjustedToday.setHours(0, 0, 0, 0);
      
      if (endDate < adjustedToday) {
        showToast('error', 
          'Already Over? ⏳', 
          'End date cannot be in the past. Choose a future date!'
        );
        return false;
      }
    }

    if (startDate && endDate && endDate <= startDate) {
      showToast('error', 
        'Time Paradox! ⚠️', 
        'End date must be after start date. We can\'t end before we begin!'
      );
      return false;
    }

    // Validate that dates align with duration (approximate)
    if (startDate && endDate && durationMonths) {
      const diffInMs = endDate.getTime() - startDate.getTime();
      const diffInMonths = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 30));
      
      // Allow some flexibility (within 1 month difference)
      if (Math.abs(diffInMonths - durationMonths) > 1) {
        showToast('warning', 
          'Dates & Duration Mismatch! 📆', 
          `Your ${durationMonths} month duration doesn't quite match the selected dates. Please adjust either.`
        );
        return false;
      }
    }

    if (!form.resume && !form.resumeUrl) {
      showToast('error', 
        'Resume Missing! 📄', 
        'Your resume is your story! Please upload it in PDF format.'
      );
      return false;
    }

    // ✅ Double-check file extension
    if (form.resume instanceof File && !form.resume.name.toLowerCase().endsWith('.pdf')) {
      showToast('error', 
        'PDF Only! 📎', 
        'We\'re PDF enthusiasts! Please upload your resume as a PDF file.'
      );
      return false;
    }

    // Check file size (max 1MB)
    if (form.resume instanceof File && form.resume.size > 1 * 1024 * 1024) {
      showToast('error', 
        'File Too Heavy! ⚖️', 
        'Resume must be less than 1MB. Try compressing it or removing images.'
      );
      return false;
    }

    // All validations passed - show encouragement
    if (progress === 100) {
      showToast('success', 
        'Ready for Submission! 📝', 
        'All systems go! Your application is ready for submission.'
      );
    }

    return true;
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!userEmail) {
      setIsSubmitting(false);
      return showToast('error', 
        'Hold On! ⏸️', 
        'Please wait while we load your details...'
      );
    }

    // Validate all fields
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('contact', form.contact);
      formData.append('cgpa', form.cgpa);
      formData.append('interest', form.interest); // Changed from interest[] to interest
      formData.append('duration', form.duration);
      formData.append('start_date', form.start_date);
      formData.append('end_date', form.end_date);
      
      // Only append resume if it's a new file
      if (form.resume instanceof File) {
        formData.append('resume', form.resume);
      }

      // Show submitting toast
      showToast('info', 
        'Submitting Your Application! 📤', 
        'Please wait while we process your submission...',
        { duration: 3000 }
      );

      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      // Success toast with celebration
      showToast('success', 
        hasSubmitted ? 'Application Updated! 🎨' : 'Application Submitted! 🎉', 
        hasSubmitted 
          ? 'Your application has been refreshed and updated!' 
          : 'Congratulations! Your internship journey begins now!',
        { duration: 5000 }
      );

      // Update the initial form with the current state
      setInitialForm({
        ...form,
        resume: null, // Clear the file object to prevent resubmission
        resumeUrl: data.resumeUrl || form.resumeUrl // Update with the new URL if available
      });
      
      setHasSubmitted(true);
      setIsEditing(false);
      setIsSubmitting(false);
      
      // Refresh the page to get updated data
      setTimeout(() => {
        router.replace(router.asPath);
      }, 2000);
      
    } catch (error) {
      setIsSubmitting(false);
      showToast('error', 
        'Submission Failed! 😅', 
        error.message || 'Something went wrong during submission. Please try again.'
      );
    }
  };

  if (isLoading) {
    return (
      <Box 
        minH="100vh" 
        bg={subtleBg}
        fontFamily="'Segoe UI', sans-serif"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={6}>
          <Box 
            p={6} 
            borderRadius="xl" 
            bgGradient="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
            color="white"
            boxShadow="xl"
            animation={`${pulse} 2s infinite`}
          >
            <Icon as={FaFileAlt} boxSize={10} />
          </Box>
          <Spinner 
            size="xl" 
            thickness="4px" 
            speed="0.65s" 
            color="purple.500"
          />
          <Text fontFamily="'Segoe UI', sans-serif" fontWeight="medium" fontSize="lg">
            Loading application form...
          </Text>
          <Text fontSize="sm" color="gray.500">Preparing everything for you</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-br, blue.50, purple.50)"
      py={10}
      px={{ base: 4, md: 0 }}
    >
      <Container maxW="6xl">
        <Button 
          mb={6} 
          colorScheme="blue" 
          variant="outline" 
          onClick={() => router.push('/student/dashboard')}
          leftIcon={<FaArrowLeft />}
          borderRadius="full"
          boxShadow="md"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          transition="all 0.2s"
        >
          Back to Dashboard
        </Button>

        <Fade in={true}>
          <Card 
            borderRadius="2xl" 
            boxShadow="2xl" 
            border="1px solid" 
            borderColor={borderColor}
            overflow="hidden"
            bg={cardBg}
          >
            <Box 
              bgGradient={`linear(to-r, ${primaryColor}, ${secondaryColor})`} 
              py={6} 
              px={8}
              color="white"
              position="relative"
            >
              <Box 
                position="Absolute" 
                top={0} 
                left={0} 
                w="100%" 
                h="100%" 
                opacity={0.1}
                bgImage="url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRo=%22%3E60JSI gaGVpZ2h0=%2260%22IHZpZXdCb3g9IjAgMCA2MCA2MCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjE1Ii8+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjUiLz48L2c+PC9zdmc+')"
              />
              <Heading size="lg" textAlign="center" position="relative">
                <Icon as={FaUserGraduate} mr={3} />
                Internship Application Form
              </Heading>
              <Text textAlign="center" mt={2} opacity={0.9} position="relative">
                {hasSubmitted ? 'View or update your application' : 'Complete your profile to apply for internships'}
              </Text>
              
              {hasSubmitted && applicationStatus && (
                <Box mt={3} textAlign="center">
                  <Badge 
                    colorScheme={
                      applicationStatus === 'approved' ? 'green' : 
                      applicationStatus === 'rejected' ? 'red' : 'yellow'
                    } 
                    fontSize="sm" 
                    borderRadius="full" 
                    px={3} 
                    py={1}
                    boxShadow="md"
                  >
                    Status: {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                    {applicationStatus === 'approved' && ' 🎉'}
                    {applicationStatus === 'rejected' && ' 😔'}
                    {applicationStatus === 'pending' && ' ⏳'}
                  </Badge>
                </Box>
              )}
            </Box>

            <CardBody p={8}>
              <Box mb={6}>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium">Application Progress</Text>
                  <Badge 
                    colorScheme={progress === 100 ? "green" : "blue"} 
                    fontSize="sm" 
                    borderRadius="full" 
                    px={2}
                    boxShadow="sm"
                  >
                    {progress}% Complete {progress === 100 && '🎯'}
                  </Badge>
                </HStack>
                <Progress 
                  value={progress} 
                  size="lg" 
                  colorScheme="blue" 
                  borderRadius="full" 
                  hasStripe 
                  isAnimated 
                />
                {progress === 100 && (
                  <Alert status="success" mt={4} borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>All systems go! 📝</AlertTitle>
                      <AlertDescription>Your application is ready for {hasSubmitted ? 'updating' : 'submission'}!</AlertDescription>
                    </Box>
                  </Alert>
                )}
              </Box>

              {hasSubmitted && !isEditing && (
                <Alert status="info" mb={6} borderRadius="md" variant="left-accent">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Application Already Submitted! 🛰️</AlertTitle>
                    <AlertDescription>
                      You&apos;ve already submitted an application. You can edit your information below.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
                <VStack spacing={8} align="stretch">
                  <Box 
                    p={6} 
                    borderRadius="xl" 
                    border="1px solid" 
                    borderColor={borderColor}
                    bg={sectionBg}
                    boxShadow="md"
                  >
                    <Heading size="md" mb={4} color={primaryColor} display="flex" alignItems="center">
                      <Icon as={FaIdCard} mr={2} />
                      Personal Information
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaUser} color="gray.400" mr={2} />
                          Full Name
                        </FormLabel>
                        <Input 
                          name="name" 
                          value={form.name} 
                          isReadOnly 
                          borderRadius="md" 
                          bg={inputBg} 
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaEnvelope} color="gray.400" mr={2} />
                          Email Address
                        </FormLabel>
                        <Input 
                          name="email" 
                          type="email" 
                          value={form.email} 
                          isReadOnly 
                          borderRadius="md" 
                          bg={inputBg} 
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaPhone} color="gray.400" mr={2} />
                          Contact Number
                        </FormLabel>
                        <Input 
                          name="contact" 
                          value={form.contact} 
                          isReadOnly 
                          borderRadius="md" 
                          bg={inputBg} 
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaStar} color="gray.400" mr={2} />
                          CGPA
                        </FormLabel>
                        <Input 
                          name="cgpa" 
                          type="number" 
                          step="0.01" 
                          value={form.cgpa} 
                          onChange={handleChange}
                          isReadOnly={!isEditing}
                          borderRadius="md" 
                          bg={isEditing ? 'white' : inputBg}
                          focusBorderColor={primaryColor}
                        />
                      </FormControl>
                    </Grid>
                  </Box>

                  <Box 
                    p={6} 
                    borderRadius="xl" 
                    border="1px solid" 
                    borderColor={borderColor}
                    bg={sectionBg}
                    boxShadow="md"
                  >
                    <Heading size="md" mb={4} color={primaryColor} display="flex" alignItems="center">
                      <Icon as={FaGraduationCap} mr={2} />
                      Academic Information
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaUniversity} color="gray.400" mr={2} />
                          College/University
                        </FormLabel>
                        <Input 
                          value={form.college} 
                          isReadOnly 
                          borderRadius="md" 
                          bg={inputBg} 
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaCodeBranch} color="gray.400" mr={2} />
                          Branch/Department
                        </FormLabel>
                        <Input 
                          value={form.branch} 
                          isReadOnly 
                          borderRadius="md" 
                          bg={inputBg} 
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaCalendarDay} color="gray.400" mr={2} />
                          Year of Study
                        </FormLabel>
                        <Input 
                          value={form.yearOfStudy} 
                          isReadOnly 
                          borderRadius="md" 
                          bg={inputBg} 
                        />
                      </FormControl>
                    </Grid>
                  </Box>

                  <Box 
                    p={6} 
                    borderRadius="xl" 
                    border="1px solid" 
                    borderColor={borderColor}
                    bg={sectionBg}
                    boxShadow="md"
                  >
                    <Heading size="md" mb={4} color={primaryColor} display="flex" alignItems="center">
                      <Icon as={FaBook} mr={2} />
                      Internship Preferences
                    </Heading>
                    
                    <FormControl isRequired mb={6}>
                      <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                        <Icon as={FaHeart} color="red.400" mr={2} />
                        Area of Interest (select one)
                      </FormLabel>
                      <RadioGroup value={form.interest} onChange={handleInterestChange}>
                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={3}>
                          {[
                            { value: 'Web Development', icon: FaLaptopCode },
                            { value: 'Machine Learning', icon: FaBrain },
                            { value: 'Artificial Intelligence', icon: FaBrain },
                            { value: 'Mobile App Development', icon: FaMobileAlt },
                            { value: 'Data Analytics', icon: FaChartBar },
                            { value: 'Cybersecurity', icon: FaShieldAlt },
                            { value: 'Cloud Computing', icon: FaCloud },
                            { value: 'Database Management', icon: FaDatabase },
                            { value: 'UI/UX', icon: FaPalette },
                            { value: 'Hardware Design', icon: FaMicrochip },
                            { value: 'Networking', icon: FaNetworkWired },
                            { value: 'Software Testing', icon: FaVial },
                          ].map(({ value, icon }) => (
                            <Radio 
                              key={value} 
                              value={value} 
                              isDisabled={!isEditing}
                              colorScheme="blue"
                              borderRadius="md"
                              p={2}
                              _hover={{ bg: radioHoverBg }}
                            >
                              <HStack spacing={2}>
                                <Icon as={icon} color={interestColors[value]} />
                                <Text>{value}</Text>
                              </HStack>
                            </Radio>
                          ))}
                        </Grid>
                      </RadioGroup>
                    </FormControl>

                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaClock} color="gray.400" mr={2} />
                          Internship Duration (months)
                        </FormLabel>
                        <Input
                          name="duration"
                          type="number"
                          min="1"
                          max="12"
                          value={form.duration}
                          onChange={handleChange}
                          placeholder="e.g., 2"
                          isDisabled={!isEditing}
                          borderRadius="md"
                          focusBorderColor={primaryColor}
                          bg={isEditing ? 'white' : inputBg}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaCalendarAlt} color="gray.400" mr={2} />
                          Preferred Start Date
                        </FormLabel>
                        <Input
                          name="start_date"
                          type="date"
                          value={form.start_date || ''}
                          onChange={handleChange}
                          isDisabled={!isEditing}
                          borderRadius="md"
                          focusBorderColor={primaryColor}
                          bg={isEditing ? 'white' : inputBg}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" display="flex" alignItems="center">
                          <Icon as={FaCalendarAlt} color="gray.400" mr={2} />
                          Preferred End Date
                        </FormLabel>
                        <Input
                          name="end_date"
                          type="date"
                          value={form.end_date || ''}
                          onChange={handleChange}
                          isDisabled={!isEditing}
                          borderRadius="md"
                          focusBorderColor={primaryColor}
                          bg={isEditing ? 'white' : inputBg}
                        />
                      </FormControl>
                    </Grid>
                  </Box>

                  <Box 
                    p={6} 
                    borderRadius="xl" 
                    border="1px solid" 
                    borderColor={borderColor}
                    bg={sectionBg}
                    boxShadow="md"
                  >
                    <Heading size="md" mb={4} color={primaryColor} display="flex" alignItems="center">
                      <Icon as={FaFilePdf} mr={2} />
                      Resume Upload
                    </Heading>
                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center" fontWeight="semibold">
                        <Icon as={FaFilePdf} color="red.500" mr={2} />
                        Upload Resume (PDF only, max 1 MB)
                        <Tooltip label="Please upload your resume in PDF format (max 1MB)" placement="top">
                          <Box ml={2}><Icon as={FaInfoCircle} boxSize={4} /></Box>
                        </Tooltip>
                      </FormLabel>
                      
                      {!form.resume && !form.resumeUrl ? (
                        <Box
                          border="2px dashed"
                          borderColor={borderColor}
                          borderRadius="xl"
                          p={10}
                          textAlign="center"
                          cursor="pointer"
                          _hover={{ borderColor: primaryColor, bg: uploadHoverBg }}
                          transition="all 0.2s"
                          onClick={() => fileInputRef.current?.click()}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                        >
                          <Input
                            ref={fileInputRef}
                            name="resume"
                            type="file"
                            onChange={handleChange}
                            isDisabled={!isEditing}
                            accept=".pdf"
                            display="none"
                          />
                          <Icon as={FaCloudUploadAlt} boxSize={10} color={primaryColor} mb={4} />
                          <Text fontWeight="medium" mb={2}>
                            Drag & Drop your resume here
                          </Text>
                          <Text fontSize="sm" color="gray.500" mb={4}>
                            or click to browse files
                          </Text>
                          <Button colorScheme="blue" variant="outline" leftIcon={<FaUpload />}>
                            Browse Files
                          </Button>
                        </Box>
                      ) : (
                        <Box 
                          p={4} 
                          border="1px solid" 
                          borderColor={borderColor} 
                          borderRadius="xl" 
                          bg={resumeBoxBg}
                        >
                          <Flex justify="space-between" align="center">
                            <Flex align="center">
                              <Icon as={FaFilePdf} boxSize={6} color="red.500" mr={3} />
                              <Box>
                                <Text fontWeight="medium">
                                  {form.resumeName || (form.resumeUrl ? 'Uploaded Resume' : 'Resume')}
                                </Text>
                                {form.resume instanceof File && (
                                  <Text fontSize="sm" color="gray.500">
                                    PDF Document • {(form.resume.size / 1024 / 1024).toFixed(2)} MB
                                  </Text>
                                )}
                                {form.resumeUrl && !form.resume && (
                                  <Text fontSize="sm" color="gray.500">
                                    Previously uploaded resume
                                  </Text>
                                )}
                              </Box>
                            </Flex>
                            <HStack>
                              <IconButton
                                icon={<FaEye />}
                                aria-label="Preview resume"
                                onClick={handleResumePreview}
                                colorScheme="blue"
                                variant="outline"
                                size="sm"
                                isDisabled={!form.resume && !form.resumeUrl}
                              />
                              <IconButton
                                icon={<FaTimes />}
                                aria-label="Remove resume"
                                onClick={handleRemoveResume}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                                isDisabled={!isEditing}
                              />
                            </HStack>
                          </Flex>
                        </Box>
                      )}
                    </FormControl>
                  </Box>

                  <Stack direction="row" justify="flex-end" pt={4} spacing={4}>
                    {!isEditing ? (
                      <Button 
                        colorScheme="blue" 
                        onClick={() => {
                          setIsEditing(true);
                          showToast('info', 
                            hasSubmitted ? 'Edit Mode Activated! ✏️' : 'Application Started! 📝',
                            hasSubmitted 
                              ? 'You can now modify your application details.' 
                              : 'You can now fill out your internship application!'
                          );
                        }}
                        leftIcon={<Icon as={FaUserGraduate} />}
                        borderRadius="full"
                        size="lg"
                        boxShadow="md"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                      >
                        {hasSubmitted ? 'Edit Application' : 'Start Application'}
                      </Button>
                    ) : (
                      <>
                        <Button 
                          type="submit" 
                          colorScheme="green" 
                          isLoading={isSubmitting}
                          loadingText={hasSubmitted ? "Updating..." : "Submitting..."}
                          leftIcon={<Icon as={FaCheckCircle} />}
                          borderRadius="full"
                          size="lg"
                          boxShadow="md"
                          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                          transition="all 0.2s"
                        >
                          {hasSubmitted ? 'Update Application' : 'Submit Application'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleCancel}
                          borderRadius="full"
                          size="lg"
                          _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                          transition="all 0.2s"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </Stack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </Fade>

        {/* Resume Preview Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Icon as={FaFilePdf} color="red.500" />
                <Text>Resume Preview</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {resumePreviewUrl && (
                <AspectRatio ratio={1 / 1.414} maxH="70vh"> 
                  <iframe src={resumePreviewUrl} width="100%" height="100%" />
                </AspectRatio>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
}