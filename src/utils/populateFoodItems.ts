import { supabase } from '@/integrations/supabase/client';
import { foodItems } from '@/data/foodItems';

export async function populateFoodItems() {
  try {
    // Check if food items already exist
    const { data: existingItems, error: checkError } = await supabase
      .from('food_items')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    // If items already exist, don't populate again
    if (existingItems && existingItems.length > 0) {
      console.log('Food items already exist in database');
      return;
    }

    // Insert food items
    const { error } = await supabase
      .from('food_items')
      .insert(foodItems);

    if (error) throw error;

    console.log('Food items populated successfully');
  } catch (error) {
    console.error('Error populating food items:', error);
    throw error;
  }
}

export async function updateFoodItemsWithEmojis() {
  try {
    console.log('Updating food items with emojis...');
    
    // Clear existing food items
    const { error: deleteError } = await supabase
      .from('food_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all items

    if (deleteError) throw deleteError;

    // Insert updated food items with emojis
    const { error: insertError } = await supabase
      .from('food_items')
      .insert(foodItems);

    if (insertError) throw insertError;

    console.log('Food items updated with emojis successfully');
  } catch (error) {
    console.error('Error updating food items:', error);
    throw error;
  }
}
