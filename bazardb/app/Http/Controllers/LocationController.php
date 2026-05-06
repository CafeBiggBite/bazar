<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * Get Bangladesh divisions, districts, and upazilas
     */
    public function index()
    {
        $locations = [
            'divisions' => [
                ['id' => 1, 'name' => 'Dhaka', 'name_bn' => 'ঢাকা'],
                ['id' => 2, 'name' => 'Chittagong', 'name_bn' => 'চট্টগ্রাম'],
                ['id' => 3, 'name' => 'Rajshahi', 'name_bn' => 'রাজশাহী'],
                ['id' => 4, 'name' => 'Khulna', 'name_bn' => 'খুলনা'],
                ['id' => 5, 'name' => 'Barisal', 'name_bn' => 'বরিশাল'],
                ['id' => 6, 'name' => 'Sylhet', 'name_bn' => 'সিলেট'],
                ['id' => 7, 'name' => 'Rangpur', 'name_bn' => 'রংপুর'],
                ['id' => 8, 'name' => 'Mymensingh', 'name_bn' => 'ময়মনসিংহ'],
            ],
            'districts' => [
                // Dhaka Division
                ['id' => 1, 'division_id' => 1, 'name' => 'Dhaka', 'name_bn' => 'ঢাকা'],
                ['id' => 2, 'division_id' => 1, 'name' => 'Gazipur', 'name_bn' => 'গাজীপুর'],
                ['id' => 3, 'division_id' => 1, 'name' => 'Narayanganj', 'name_bn' => 'নারায়ণগঞ্জ'],
                ['id' => 4, 'division_id' => 1, 'name' => 'Savar', 'name_bn' => 'সাভার'],
                ['id' => 5, 'division_id' => 1, 'name' => 'Tangail', 'name_bn' => 'টাঙ্গাইল'],
                ['id' => 6, 'division_id' => 1, 'name' => 'Kishoreganj', 'name_bn' => 'কিশোরগঞ্জ'],
                ['id' => 7, 'division_id' => 1, 'name' => 'Manikganj', 'name_bn' => 'মানিকগঞ্জ'],
                ['id' => 8, 'division_id' => 1, 'name' => 'Munshiganj', 'name_bn' => 'মুন্সিগঞ্জ'],
                ['id' => 9, 'division_id' => 1, 'name' => 'Narsingdi', 'name_bn' => 'নরসিংদী'],
                ['id' => 10, 'division_id' => 1, 'name' => 'Faridpur', 'name_bn' => 'ফরিদপুর'],
                ['id' => 11, 'division_id' => 1, 'name' => 'Gopalganj', 'name_bn' => 'গোপালগঞ্জ'],
                ['id' => 12, 'division_id' => 1, 'name' => 'Madaripur', 'name_bn' => 'মাদারীপুর'],
                ['id' => 13, 'division_id' => 1, 'name' => 'Rajbari', 'name_bn' => 'রাজবাড়ী'],
                ['id' => 14, 'division_id' => 1, 'name' => 'Shariatpur', 'name_bn' => 'শরীয়তপুর'],
                
                // Chittagong Division
                ['id' => 15, 'division_id' => 2, 'name' => 'Chittagong', 'name_bn' => 'চট্টগ্রাম'],
                ['id' => 16, 'division_id' => 2, 'name' => 'Cox\'s Bazar', 'name_bn' => 'কক্সবাজার'],
                ['id' => 17, 'division_id' => 2, 'name' => 'Comilla', 'name_bn' => 'কুমিল্লা'],
                ['id' => 18, 'division_id' => 2, 'name' => 'Feni', 'name_bn' => 'ফেনী'],
                ['id' => 19, 'division_id' => 2, 'name' => 'Brahmanbaria', 'name_bn' => 'ব্রাহ্মণবাড়িয়া'],
                ['id' => 20, 'division_id' => 2, 'name' => 'Noakhali', 'name_bn' => 'নোয়াখালী'],
                ['id' => 21, 'division_id' => 2, 'name' => 'Chandpur', 'name_bn' => 'চাঁদপুর'],
                ['id' => 22, 'division_id' => 2, 'name' => 'Lakshmipur', 'name_bn' => 'লক্ষ্মীপুর'],
                ['id' => 23, 'division_id' => 2, 'name' => 'Khagrachari', 'name_bn' => 'খাগড়াছড়ি'],
                ['id' => 24, 'division_id' => 2, 'name' => 'Rangamati', 'name_bn' => 'রাঙামাটি'],
                ['id' => 25, 'division_id' => 2, 'name' => 'Bandarban', 'name_bn' => 'বান্দরবান'],
                
                // Rajshahi Division
                ['id' => 26, 'division_id' => 3, 'name' => 'Rajshahi', 'name_bn' => 'রাজশাহী'],
                ['id' => 27, 'division_id' => 3, 'name' => 'Bogra', 'name_bn' => 'বগুড়া'],
                ['id' => 28, 'division_id' => 3, 'name' => 'Pabna', 'name_bn' => 'পাবনা'],
                ['id' => 29, 'division_id' => 3, 'name' => 'Sirajganj', 'name_bn' => 'সিরাজগঞ্জ'],
                ['id' => 30, 'division_id' => 3, 'name' => 'Natore', 'name_bn' => 'নাটোর'],
                ['id' => 31, 'division_id' => 3, 'name' => 'Naogaon', 'name_bn' => 'নওগাঁ'],
                ['id' => 32, 'division_id' => 3, 'name' => 'Joypurhat', 'name_bn' => 'জয়পুরহাট'],
                ['id' => 33, 'division_id' => 3, 'name' => 'Chapainawabganj', 'name_bn' => 'চাঁপাইনবাবগঞ্জ'],
                
                // Khulna Division
                ['id' => 34, 'division_id' => 4, 'name' => 'Khulna', 'name_bn' => 'খুলনা'],
                ['id' => 35, 'division_id' => 4, 'name' => 'Jessore', 'name_bn' => 'যশোর'],
                ['id' => 36, 'division_id' => 4, 'name' => 'Satkhira', 'name_bn' => 'সাতক্ষীরা'],
                ['id' => 37, 'division_id' => 4, 'name' => 'Bagerhat', 'name_bn' => 'বাগেরহাট'],
                ['id' => 38, 'division_id' => 4, 'name' => 'Jhenaidah', 'name_bn' => 'ঝিনাইদহ'],
                ['id' => 39, 'division_id' => 4, 'name' => 'Magura', 'name_bn' => 'মাগুরা'],
                ['id' => 40, 'division_id' => 4, 'name' => 'Narail', 'name_bn' => 'নড়াইল'],
                ['id' => 41, 'division_id' => 4, 'name' => 'Chuadanga', 'name_bn' => 'চুয়াডাঙ্গা'],
                ['id' => 42, 'division_id' => 4, 'name' => 'Kushtia', 'name_bn' => 'কুষ্টিয়া'],
                ['id' => 43, 'division_id' => 4, 'name' => 'Meherpur', 'name_bn' => 'মেহেরপুর'],
                
                // Barisal Division
                ['id' => 44, 'division_id' => 5, 'name' => 'Barisal', 'name_bn' => 'বরিশাল'],
                ['id' => 45, 'division_id' => 5, 'name' => 'Patuakhali', 'name_bn' => 'পটুয়াখালী'],
                ['id' => 46, 'division_id' => 5, 'name' => 'Bhola', 'name_bn' => 'ভোলা'],
                ['id' => 47, 'division_id' => 5, 'name' => 'Pirojpur', 'name_bn' => 'পিরোজপুর'],
                ['id' => 48, 'division_id' => 5, 'name' => 'Jhalokati', 'name_bn' => 'ঝালকাঠি'],
                ['id' => 49, 'division_id' => 5, 'name' => 'Barguna', 'name_bn' => 'বরগুনা'],
                
                // Sylhet Division
                ['id' => 50, 'division_id' => 6, 'name' => 'Sylhet', 'name_bn' => 'সিলেট'],
                ['id' => 51, 'division_id' => 6, 'name' => 'Moulvibazar', 'name_bn' => 'মৌলভীবাজার'],
                ['id' => 52, 'division_id' => 6, 'name' => 'Habiganj', 'name_bn' => 'হবিগঞ্জ'],
                ['id' => 53, 'division_id' => 6, 'name' => 'Sunamganj', 'name_bn' => 'সুনামগঞ্জ'],
                
                // Rangpur Division
                ['id' => 54, 'division_id' => 7, 'name' => 'Rangpur', 'name_bn' => 'রংপুর'],
                ['id' => 55, 'division_id' => 7, 'name' => 'Dinajpur', 'name_bn' => 'দিনাজপুর'],
                ['id' => 56, 'division_id' => 7, 'name' => 'Gaibandha', 'name_bn' => 'গাইবান্ধা'],
                ['id' => 57, 'division_id' => 7, 'name' => 'Kurigram', 'name_bn' => 'কুড়িগ্রাম'],
                ['id' => 58, 'division_id' => 7, 'name' => 'Lalmonirhat', 'name_bn' => 'লালমনিরহাট'],
                ['id' => 59, 'division_id' => 7, 'name' => 'Nilphamari', 'name_bn' => 'নীলফামারী'],
                ['id' => 60, 'division_id' => 7, 'name' => 'Panchagarh', 'name_bn' => 'পঞ্চগড়'],
                ['id' => 61, 'division_id' => 7, 'name' => 'Thakurgaon', 'name_bn' => 'ঠাকুরগাঁও'],
                
                // Mymensingh Division
                ['id' => 62, 'division_id' => 8, 'name' => 'Mymensingh', 'name_bn' => 'ময়মনসিংহ'],
                ['id' => 63, 'division_id' => 8, 'name' => 'Jamalpur', 'name_bn' => 'জামালপুর'],
                ['id' => 64, 'division_id' => 8, 'name' => 'Netrokona', 'name_bn' => 'নেত্রকোণা'],
                ['id' => 65, 'division_id' => 8, 'name' => 'Sherpur', 'name_bn' => 'শেরপুর'],
            ],
            'upazilas' => [
                // Sample upazilas for major districts (simplified)
                ['id' => 1, 'district_id' => 1, 'name' => 'Dhanmondi', 'name_bn' => 'ধানমন্ডি'],
                ['id' => 2, 'district_id' => 1, 'name' => 'Gulshan', 'name_bn' => 'গুলশান'],
                ['id' => 3, 'district_id' => 1, 'name' => 'Mirpur', 'name_bn' => 'মিরপুর'],
                ['id' => 4, 'district_id' => 1, 'name' => 'Motijheel', 'name_bn' => 'মতিঝিল'],
                ['id' => 5, 'district_id' => 1, 'name' => 'Uttara', 'name_bn' => 'উত্তরা'],
                ['id' => 6, 'district_id' => 1, 'name' => 'Banani', 'name_bn' => 'বনানী'],
                ['id' => 7, 'district_id' => 1, 'name' => 'Mohammadpur', 'name_bn' => 'মোহাম্মদপুর'],
                ['id' => 8, 'district_id' => 1, 'name' => 'Tejgaon', 'name_bn' => 'তেজগাঁও'],
                ['id' => 9, 'district_id' => 2, 'name' => 'Gazipur Sadar', 'name_bn' => 'গাজীপুর সদর'],
                ['id' => 10, 'district_id' => 2, 'name' => 'Kaliakair', 'name_bn' => 'কালিয়াকৈর'],
                ['id' => 11, 'district_id' => 2, 'name' => 'Kapasia', 'name_bn' => 'কাপাসিয়া'],
                ['id' => 12, 'district_id' => 3, 'name' => 'Narayanganj Sadar', 'name_bn' => 'নারায়ণগঞ্জ সদর'],
                ['id' => 13, 'district_id' => 3, 'name' => 'Sonargaon', 'name_bn' => 'সোনারগাঁও'],
                ['id' => 14, 'district_id' => 3, 'name' => 'Bandar', 'name_bn' => 'বন্দর'],
                ['id' => 15, 'district_id' => 15, 'name' => 'Chittagong Sadar', 'name_bn' => 'চট্টগ্রাম সদর'],
                ['id' => 16, 'district_id' => 15, 'name' => 'Patiya', 'name_bn' => 'পটিয়া'],
                ['id' => 17, 'district_id' => 15, 'name' => 'Raozan', 'name_bn' => 'রাউজান'],
                ['id' => 18, 'district_id' => 16, 'name' => 'Cox\'s Bazar Sadar', 'name_bn' => 'কক্সবাজার সদর'],
                ['id' => 19, 'district_id' => 16, 'name' => 'Teknaf', 'name_bn' => 'টেকনাফ'],
                ['id' => 20, 'district_id' => 16, 'name' => 'Ukhia', 'name_bn' => 'উখিয়া'],
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $locations,
        ]);
    }
}
