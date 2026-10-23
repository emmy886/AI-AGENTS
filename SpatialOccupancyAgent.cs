using System;
using System.IO;
using System.ClientModel;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using OpenAI;
using OpenAI.Chat;

namespace SpatialAgentDemo
{
    public class RoomOccupancyReport
    {
        [JsonPropertyName("total_occupants")]
        public int TotalOccupants { get; set; }

        [JsonPropertyName("total_objects_tracked")]
        public int TotalObjectsTracked { get; set; }

        [JsonPropertyName("room_context_summary")]
        public string RoomContextSummary { get; set; }

        [JsonPropertyName("entities")]
        public List<SpatialEntity> Entities { get; set; } = new();
    }

    public class SpatialEntity
    {
        [JsonPropertyName("entity_name")]
        public string EntityName { get; set; } = string.Empty;

        [JsonPropertyName("entity_type")]
        public string EntityType { get; set; } = string.Empty;

        [JsonPropertyName("estimated_distance_meters")]
        public float EstimatedDistanceMeters { get; set; }

        [JsonPropertyName("relative_position")]
        public string RelativePosition { get; set; } = string.Empty;

        [JsonPropertyName("orientation_or_pose")]
        public string OrientationOrPose { get; set; } = string.Empty;
    }

    public class SpatialOccupancyAgent
    {
        private readonly ChatClient _chatClient;

        public SpatialOccupancyAgent(string apiKey)
        {
            _chatClient = new ChatClient("gpt-4o", new ApiKeyCredential(apiKey));
        }

        public async Task<RoomOccupancyReport> AnalyzeRoomAsync(string imagePath)
        {
            if (!File.Exists(imagePath))
                throw new FileNotFoundException($"Test image file not found. Ensure '{imagePath}' exists.", imagePath);

            byte[] imageBytes = await File.ReadAllBytesAsync(imagePath);
            BinaryData imageBinaryData = BinaryData.FromBytes(imageBytes);

            string prompt = 
                "You are an advanced computer vision and spatial intelligence agent. " +
                "Analyze this office cubicle image. Identify the humans seated behind the partition, " +
                "key workspace objects, estimate their distances from the camera viewpoint, " +
                "and detail their relative positions within the room layout.";

            ChatCompletionOptions options = new()
            {
                ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                    jsonSchemaFormatName: "room_occupancy_report",
                    jsonSchema: BinaryData.FromString(GetJsonSchemaDefinition()),
                    jsonSchemaIsStrict: true
                )
            };

            List<ChatMessage> messages = new()
            {
                new UserChatMessage(
                    ChatMessageContentPart.CreateTextPart(prompt),
                    ChatMessageContentPart.CreateImagePart(imageBinaryData, "image/jpeg")
                )
            };

            ClientResult<ChatCompletion> result = await _chatClient.CompleteChatAsync(messages, options);
            ChatCompletion completion = result.Value;

            string jsonResponse = completion.Content[0].Text;
            return JsonSerializer.Deserialize<RoomOccupancyReport>(jsonResponse) ?? new RoomOccupancyReport();
        }

        private static string GetJsonSchemaDefinition()
        {
            return @"{
                ""type"": ""object"",
                ""properties"": {
                    ""total_occupants"": { ""type"": ""integer"" },
                    ""total_objects_tracked"": { ""type"": ""integer"" },
                    ""room_context_summary"": { ""type"": ""string"" },
                    ""entities"": {
                        ""type"": ""array"",
                        ""items"": {
                            ""type"": ""object"",
                            ""properties"": {
                                ""entity_name"": { ""type"": ""string"" },
                                ""entity_type"": { ""type"": ""string"" },
                                ""estimated_distance_meters"": { ""type"": ""number"" },
                                ""relative_position"": { ""type"": ""string"" },
                                ""orientation_or_pose"": { ""type"": ""string"" }
                            },
                            ""required"": [""entity_name"", ""entity_type"", ""estimated_distance_meters"", ""relative_position"", ""orientation_or_pose""],
                            ""additionalProperties"": false
                        }
                    }
                },
                ""required"": [""total_occupants"", ""total_objects_tracked"", ""room_context_summary"", ""entities""],
                ""additionalProperties"": false
            }";
        }
    }

    public class Program
    {
        public static async Task Main(string[] args)
        {
            string? apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine("Warning: OPENAI_API_KEY environment variable is not set.");
                Console.WriteLine("Please set OPENAI_API_KEY or provide one via the web dashboard.");
                return;
            }

            var agent = new SpatialOccupancyAgent(apiKey);
            string sampleImagePath = "office_test_image.jpg";

            try
            {
                Console.WriteLine("Analyzing office test image through the spatial agent...");
                RoomOccupancyReport report = await agent.AnalyzeRoomAsync(sampleImagePath);

                Console.WriteLine("\n--- Spatial Analysis Report ---");
                Console.WriteLine($"Total Occupants: {report.TotalOccupants}");
                Console.WriteLine($"Objects Tracked: {report.TotalObjectsTracked}");
                Console.WriteLine($"Summary: {report.RoomContextSummary}\n");

                foreach (var entity in report.Entities)
                {
                    Console.WriteLine($"- [{entity.EntityType}] {entity.EntityName} | Position: {entity.RelativePosition} | Distance: {entity.EstimatedDistanceMeters}m | Pose: {entity.OrientationOrPose}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }
    }
}
