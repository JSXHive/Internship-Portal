import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({});

const ChakraWrapper = ({ children }) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
);

export default ChakraWrapper;
