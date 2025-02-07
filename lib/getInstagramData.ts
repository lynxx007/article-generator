export const getInstagramData = async (username: string) => {
    try {
        const responses = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
            {
                headers: {
                    "x-ig-app-id": "936619743392459",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9,ru;q=0.8",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept": "*/*",
                    "Sec-Fetch-Site": "same-origin",
                }
            }
        );
        const data = await responses.json();
        return data
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch data from Instagram");
    }
}