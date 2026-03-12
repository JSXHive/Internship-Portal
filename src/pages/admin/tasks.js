import {
  Box,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Text,
  Badge,
  Collapse,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AdminTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [showType, setShowType] = useState(""); // "completed" | "pending"

  useEffect(() => {
    setTasks([
      {
        student: "Alice",
        date: "2025-07-28",
        task: "Completed frontend UI",
        completed: true,
        docUrl: "https://example.com/alice-doc.pdf",
      },
      {
        student: "Alice",
        date: "2025-07-29",
        task: "API integration",
        completed: false,
        docUrl: "",
      },
      {
        student: "Bob",
        date: "2025-07-28",
        task: "Connected backend to database",
        completed: false,
        docUrl: "",
      },
    ]);
  }, []);

  const students = [...new Set(tasks.map((t) => t.student))];

  const getStudentStats = (student) => {
    const studentTasks = tasks.filter((t) => t.student === student);
    const completed = studentTasks.filter((t) => t.completed);
    const pending = studentTasks.filter((t) => !t.completed);
    return { completed, pending };
  };

  const handleStatClick = (student, type) => {
    if (expandedStudent === student && showType === type) {
      setExpandedStudent(null);
      setShowType("");
    } else {
      setExpandedStudent(student);
      setShowType(type);
    }
  };

  return (
    <Box bg="gray.100" minH="100vh" p={10}>
      <Button mb={6} colorScheme="gray" onClick={() => router.push("/admin")}>
        ← Back to Admin Dashboard
      </Button>

      <Heading mb={6}>Assigned Tasks Overview</Heading>

      {students.map((student) => {
        const { completed, pending } = getStudentStats(student);
        const isExpanded = expandedStudent === student;

        return (
          <Box
            key={student}
            mb={8}
            p={4}
            bg="white"
            rounded="lg"
            shadow="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <Heading size="md" mb={4}>
              {student}
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Stat
                p={4}
                bg="green.50"
                rounded="md"
                _hover={{ cursor: "pointer", bg: "green.100" }}
                onClick={() => handleStatClick(student, "completed")}
              >
                <StatLabel>Completed Tasks</StatLabel>
                <StatNumber>{completed.length}</StatNumber>
              </Stat>
              <Stat
                p={4}
                bg="red.50"
                rounded="md"
                _hover={{ cursor: "pointer", bg: "red.100" }}
                onClick={() => handleStatClick(student, "pending")}
              >
                <StatLabel>Pending Tasks</StatLabel>
                <StatNumber>{pending.length}</StatNumber>
              </Stat>
            </SimpleGrid>

            <Collapse in={isExpanded}>
              <VStack align="start" mt={4} spacing={3}>
                {(showType === "completed" ? completed : pending).map((task, idx) => (
                  <Box
                    key={idx}
                    p={3}
                    w="100%"
                    bg="gray.100"
                    rounded="md"
                    border="1px"
                    borderColor="gray.300"
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="bold">{task.task}</Text>
                      <Badge colorScheme={task.completed ? "green" : "red"}>
                        {task.completed ? "Completed" : "Pending"}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      Date: {task.date}
                    </Text>
                    {task.docUrl && (
                      <Text fontSize="sm" color="teal.600">
                        <a href={task.docUrl} target="_blank">View Documentation</a>
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}
