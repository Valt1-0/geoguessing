<template>
  <div class="flex flex-col items-center p-4">
    <h1 class="text-3xl font-bold mb-4">Guess the Country</h1>
    <div class="flex mb-4">
      <img
        v-for="n in lives"
        :key="n"
        src="/assets/lives.png"
        class="w-8 h-8 mx-1 border-white border-2 rounded-full"
        alt="Life"
      />
    </div>
    <p class="mb-4">{{ description }}</p>
    <UInput
      v-model="userInput"
      @keyup.enter="checkAnswer"
      placeholder="Name"
      class="mb-4 p-2 rounded w-full max-w-md"
    />
    <Map
      :highlighted-countries="incorrectCountries"
      :target-country="guessedCountry"
      @country-click="highlightCountry"
      class="mb-4"
    />
    <div v-if="incorrectCountries.length" class="w-full max-w-md">
      <h2 class="text-xl font-semibold mb-2">Incorrect Guesses</h2>
      <ul class="list-disc pl-5">
        <li
          v-for="country in incorrectCountries"
          :key="country"
          class="bg-[#4ADE80] p-2 mb-1 border border-red-500 text-red-500 rounded"
        >
          {{ country }}
        </li>
      </ul>
    </div>
    <UButton
      @click="resetGame"
      class="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Reset
    </UButton>
    <UNotifications />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useToast } from "#imports";
import Map from "@/components/Map.vue";

const toast = useToast();
const description = ref("");
const correctCountry = ref("");
const guessedCountry = ref("");
const userInput = ref("");
const incorrectCountries = ref([]);
const lives = ref(3); // Initialize with 3 lives

// Load the sound files
let loseLifeSound, winGameSound;
if (typeof Audio !== "undefined") {
  loseLifeSound = new Audio("/assets/lose-life.mp3");
  winGameSound = new Audio("/assets/win-game.mp3");
}

// Function to get a random country
const getRandomCountry = async () => {
  try {
    const response = await fetch("/countries.json");
    const data = await response.json();
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  } catch (error) {
    console.error("Failed to fetch countries descriptions:", error);
  }
};

// Reset the game
const resetGame = async () => {
  const randomCountry = await getRandomCountry();
  if (randomCountry) {
    correctCountry.value = randomCountry.country;
    description.value = randomCountry.description;
    guessedCountry.value = ""; // Reset guessedCountry to not show the country in green
    incorrectCountries.value = [];
    userInput.value = "";
    lives.value = 3; // Reset lives to 3
  }
};

// Check the user's answer
const checkAnswer = () => {
  const userCountry = userInput.value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const correctNormalized = correctCountry.value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (userCountry === correctNormalized) {
    guessedCountry.value = correctCountry.value; // Set guessedCountry to the correct country
    if (winGameSound) winGameSound.play(); // Play win game sound
    toast.add({
      title: "Congratulations!",
      description: "You guessed the country.",
      type: "success",
    });
    setTimeout(resetGame, 4000); // Reset game after 3 seconds
  } else {
    if (userCountry && !incorrectCountries.value.includes(userCountry)) {
      incorrectCountries.value.push(userInput.value);
      lives.value--; // Decrease lives by 1
      if (loseLifeSound) loseLifeSound.play(); // Play lose life sound
      updateMapStyles(); // Update the map styles
    }
    userInput.value = "";

    if (lives.value === 0) {
      toast.add({
        title: "Game Over",
        description: "You have no lives left.",
        type: "error",
      });
      resetGame(); // Reset game when lives are over
    }
  }
};

// Highlight the clicked country on the map
const highlightCountry = (countryName) => {
  const countryNormalized = countryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const correctNormalized = correctCountry.value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (countryNormalized === correctNormalized) {
    if (winGameSound) winGameSound.play(); // Play win game sound
    toast.add({
      title: "Congratulations!",
      description: "You clicked on the correct country.",
      type: "success",
    });
    guessedCountry.value = correctCountry.value; // Set guessedCountry to the correct country
    setTimeout(resetGame, 4000); // Reset game after 3 seconds
  } else {
    if (!incorrectCountries.value.includes(countryName)) {
      incorrectCountries.value.push(countryName);
      lives.value--; // Decrease lives by 1
      if (loseLifeSound) loseLifeSound.play(); // Play lose life sound
      updateMapStyles(); // Update the map styles
    }

    if (lives.value === 0) {
      toast.add({
        title: "Game Over",
        description: "You have no lives left.",
        type: "error",
      });
      resetGame(); // Reset game when lives are over
    }
  }
};

// Update map styles
const updateMapStyles = () => {
  incorrectCountries.value = [...incorrectCountries.value]; // Trigger reactivity by copying the array
};

// Initialize the game only when mounted
onMounted(() => {
  resetGame();
});
</script>

<style scoped>
@import "tailwindcss/tailwind.css";
</style>
