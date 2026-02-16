import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThumbsUp, Share2, GitCompare, MoreVertical } from "lucide-react";

interface ProfileActionsMenuProps {
  userHasLiked: boolean;
  likesCount: number;
  onLike: () => void;
  onShare: () => void;
  onCompare?: () => void;
  isOwner: boolean;
  isLikePending?: boolean;
}

export function ProfileActionsMenu({
  userHasLiked,
  likesCount,
  onLike,
  onShare,
  onCompare,
  isOwner,
  isLikePending = false,
}: ProfileActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="hidden sm:inline">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onLike} disabled={isLikePending}>
          <ThumbsUp className={`mr-2 h-4 w-4 ${userHasLiked ? 'fill-current' : ''}`} />
          <span>{userHasLiked ? 'Unlike' : 'Like'} ({likesCount})</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        {isOwner && onCompare && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCompare}>
              <GitCompare className="mr-2 h-4 w-4" />
              <span>Compare Roasts</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
