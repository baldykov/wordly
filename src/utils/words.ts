import axios from "axios";
import { API_TOKEN, WORDS } from "../const";

export const checkWordExists = async (word: string): Promise<boolean> => {
    try {
        const response = await axios.get(`https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${API_TOKEN}&lang=ru-ru&text=${word}`);

        return response.status === 200 && 'def' in response.data && Array.isArray(response.data.def) && response.data.def.length > 0;
    } catch (error) {
        return false;
    }
};

const getRandomWord = () => String(WORDS[Math.floor(Math.random() * WORDS.length)]).toUpperCase(); // Случайное слово для игры

export const getRandomExistsWord = async () => {
    for (let i = 0; i < 20; i++) {
        const word = getRandomWord();

        if (await checkWordExists(word)) {
            return word;
        } else {
            i++;
        }
    }
}
