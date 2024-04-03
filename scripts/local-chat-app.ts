import axios from 'axios';
import inquirer from 'inquirer';

async function sendTextToAPI(text: string): Promise<string> {
  try {
    const response = await axios.post('http://localhost:7999/chatbot', {
      text,
    });
    return response.data.reply;
  } catch (error) {
    console.error('Error:', error.message);
    return `"Failed to connect to API. Have you forgotten to run docker-compose up?`;
  }
}

async function chatApp() {
  console.log('Welcome to Chat App! Type "exit" to quit.');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const prompt = inquirer.createPromptModule();

    const { userInput } = await prompt<{ userInput: string }>({
      type: 'input',
      name: 'userInput',
      message: 'You: ',
    });

    if (userInput.toLowerCase() === 'exit') {
      break;
    }

    const reply = await sendTextToAPI(userInput);
    console.log('ChatBot:', reply);
  }

  console.log('Goodbye!');
}

chatApp();
