async function startScreenRecording() {
    console.log("vitor runing https://wilderness-mo-hills-expanding.trycloudflare.com")
    try {
        // Get screen recording stream
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        let recordedChunks = [];

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });

            // Convert Blob to File (API may require a File instead of Blob)
            const domain = "rohit-cybersify.myshopify.com";  
            const filename = `${domain.replace(/\./g, "_")}.webm`;  // Convert dots to underscores
            const file = new File([blob], filename, { type: "video/webm" });

            console.log("Blob:", blob);
            console.log("Filename:", filename);
            console.log("File:", file);

            // Create FormData and append fields
            const formData = new FormData();
            formData.append("domain", domain);
            formData.append("country", "YourCountry");     
            formData.append("message", "Your message here");
            formData.append("video", file);  // Append the actual file, not just the filename

            // Log FormData content before sending
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            // Send the video file to the API using Axios
            try {
                const response = await axios.post(
                    "https://wilderness-mo-hills-expanding.trycloudflare.com/app/api/post/visitorVideoSave",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                console.log("API Response:", response.data);
            } catch (error) {
                console.error("Error uploading video:", error);
            }
        };

        // Start recording
        mediaRecorder.start();
        console.log("Recording started...");

        // Stop recording after 10 seconds
        setTimeout(() => {
            mediaRecorder.stop();
            console.log("Recording stopped.");
        }, 10000);

    } catch (error) {
        console.error("Error accessing screen recording:", error);
    }
}

// Start recording when the page loads
window.onload = startScreenRecording;
