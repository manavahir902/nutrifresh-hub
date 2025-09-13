import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateFoodItemsWithEmojis } from '@/utils/populateFoodItems';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function UpdateFoodItems() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateStatus('idle');
    
    try {
      await updateFoodItemsWithEmojis();
      setUpdateStatus('success');
      toast({
        title: "Food Items Updated!",
        description: "All food items have been updated with emojis and new items.",
      });
    } catch (error) {
      console.error('Update failed:', error);
      setUpdateStatus('error');
      toast({
        title: "Update Failed",
        description: "Failed to update food items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5" />
          <span>Update Food Items</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Update the database with emoji-enhanced food items and new additions.
        </p>
        
        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Food Items
            </>
          )}
        </Button>

        {updateStatus === 'success' && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Food items updated successfully!</span>
          </div>
        )}

        {updateStatus === 'error' && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Update failed. Please try again.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
