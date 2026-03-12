const updateStatus = async (index, newStatus) => {
  const updated = [...requests];
  updated[index].status = newStatus;
  setRequests(updated);

  const student = updated[index];

  try {
    const res = await fetch("/api/send-decision-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: student.email,
        name: student.name,
        status: newStatus
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send email");
    }

    alert(`Status changed to "${newStatus}" for ${student.name} and email sent.`);
  } catch (err) {
    console.error(err);
    alert(`Status updated but failed to send email for ${student.name}.`);
  }
};
