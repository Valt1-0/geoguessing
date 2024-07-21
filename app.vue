<template>
  <div class="flex flex-col items-center p-4">
    <h1 class="text-3xl font-bold mb-4">Guess the Country</h1>
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

// Fonction pour obtenir un pays aléatoire
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

// Réinitialiser le jeu
const resetGame = async () => {
  const randomCountry = await getRandomCountry();
  if (randomCountry) {
    correctCountry.value = randomCountry.country;
    description.value = randomCountry.description;
    guessedCountry.value = ""; // Réinitialiser guessedCountry pour ne pas afficher le pays en vert
    incorrectCountries.value = [];
    userInput.value = "";
  }
};

// Vérifier la réponse de l'utilisateur
const checkAnswer = () => {
  const userCountry = userInput.value.trim();
  if (userCountry.toLowerCase() === correctCountry.value.toLowerCase()) {
    guessedCountry.value = correctCountry.value; // Définir guessedCountry au pays correct
    toast.add({
      title: "Félicitations !",
      description: "Vous avez deviné le pays.",
      type: "success",
    });
  } else {
    if (userCountry && !incorrectCountries.value.includes(userCountry)) {
      incorrectCountries.value.push(userCountry);
      updateMapStyles(); // Appeler la mise à jour des styles immédiatement
    }
    userInput.value = "";
  }
};

// Mettre à jour les styles de la carte
const updateMapStyles = () => {
  incorrectCountries.value = [...incorrectCountries.value]; // Triggère la réactivité en copiant le tableau
};

// Mettre en surbrillance le pays cliqué sur la carte
const highlightCountry = (countryName) => {
  if (countryName.toLowerCase() === correctCountry.value.toLowerCase()) {
    toast.add({
      title: "Félicitations !",
      description: "Vous avez cliqué sur le bon pays.",
      type: "success",
    });
    guessedCountry.value = correctCountry.value; // Définir guessedCountry au pays correct
  } else {
    if (!incorrectCountries.value.includes(countryName)) {
      incorrectCountries.value.push(countryName);
      updateMapStyles(); // Appeler la mise à jour des styles immédiatement
    }
  }
};

// Initialisation du jeu uniquement lors du montage
onMounted(() => {
  resetGame();
});
</script>

<style scoped>
@import "tailwindcss/tailwind.css";
</style>
