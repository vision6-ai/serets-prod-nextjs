import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { BookingIframeProps } from './types';

export function BookingIframe({ selectedShow, onBack }: BookingIframeProps) {
	console.log(selectedShow);
	return (
		<div className="fixed inset-0 flex flex-col bg-background">
			<div className="absolute top-2 left-2 z-10">
				<Button
					variant="ghost"
					size="icon"
					onClick={onBack}
					className="bg-white/90 hover:bg-white shadow-md">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</Button>
			</div>

			{selectedShow && (
				<iframe
					src={selectedShow.deep_link}
					className="flex-1 w-full border-0"
					allow="payment"
					title="Ticket Booking"
				/>
			)}
		</div>
	);
}
