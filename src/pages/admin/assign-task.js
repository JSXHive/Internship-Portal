import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function AssignTaskPage() {
  const [student, setStudent] = useState("");
  const [date, setDate] = useState("");
  const [task, setTask] = useState("");
  const toast = useToast();
  const router = useRouter();

  const handleAssign = () => {
    if (!student || !date || !task) {
      toast({
        title: "All fields are required.",
        status: "warning",
        isClosable: true,
      });
      return;
    }

    // Simulate task assignment
    console.log({ student, date, task });
    toast({
      title: `Task assigned to ${student}`,
      status: "success",
      isClosable: true,
    });

    setStudent("");
    setDate("");
    setTask("");
  };

  return (
    <Box bg="gray.100" minH="100vh" p={10}>
      <Button mb={6} colorScheme="gray" onClick={() => router.push("/admin")}>
        ← Back to Admin Dashboard
      </Button>

      <Box
        bg="white"
        p={8}
        rounded="md"
        shadow="md"
        maxW="lg"
        mx="auto"
        mt={4}
      >
        <Heading fontSize="2xl" mb={6} textAlign="center">
          Assign Task to Student
        </Heading>

        <FormControl mb={4}>
          <FormLabel>Select Student</FormLabel>
          <Select
            placeholder="Select student"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
          >
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
            <option value="Charlie">Charlie</option>
          </Select>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Date</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel>Task Description</FormLabel>
          <Textarea
            placeholder="Describe the task here"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </FormControl>

        <Button colorScheme="teal" w="full" onClick={handleAssign}>
          Assign Task
        </Button>
      </Box>
    </Box>
  );
}
