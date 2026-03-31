// import { GreenOceanService } from "@/services/ferryServices/greenOceanService";
// import { useMutation, useQueryClient } from "@tanstack/react-query"

// export const useSeatBlocking = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (blockingData: SeatBlockingRequest) => {
//       return GreenOceanService.blockSeats(
//         blockingData.routeId,
//         blockingData.ferryId,
//         blockingData.classId,
//         blockingData.seatNumbers,
//         blockingData.travelDate
//       );
//     },
//     onSuccess: (data, variables) => {
//       // Invalidate seat layout to show updated availability
//       queryClient.invalidateQueries({
//         queryKey: [
//           "seat-layout",
//           "greenocean",
//           variables.ferryId,
//           variables.classId,
//         ],
//       });
//     },
//     onError: (error) => {
//       console.error("Seat blocking failed:", error);
//     },
//   });
// };
