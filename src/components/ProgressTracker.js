// components/ProgressTracker.js
import React from "react";
import {
  Box,
  Progress,
  Text,
  HStack,
  VStack,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";

const ProgressTracker = ({ students, title = "Student Progress" }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const getProgressColor = (progress) => {
    if (progress >= 80) return "green";
    if (progress >= 60) return "blue";
    return "orange";
  };

  return (
    <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="md">
      <Text fontSize="xl" fontWeight="bold" mb={4}>{title}</Text>
      <VStack spacing={4}>
        {students.map((student, index) => (
          <Box key={student.id} width="100%">
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="medium">
                {index + 1}. {student.name}
              </Text>
              <Badge colorScheme={getProgressColor(student.progress)}>
                {student.progress}%
              </Badge>
            </HStack>
            <Progress 
              value={student.progress} 
              colorScheme={getProgressColor(student.progress)}
              size="lg" 
              borderRadius="full"
            />
            <HStack justify="space-between" mt={2}>
              <Text fontSize="sm" color={textColor}>
                Tasks: {student.tasksCompleted || 0} completed
              </Text>
              <Text fontSize="sm" color={textColor}>
                {student.tasksPending || 0} pending
              </Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ProgressTracker;