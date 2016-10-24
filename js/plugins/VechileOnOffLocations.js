#------------------------------------------------------------------------------#
#  Galv's Vehicle On Off Locations
#------------------------------------------------------------------------------#
#  For: RPGMAKER VX ACE
#  Version 1.5
#------------------------------------------------------------------------------#
#  2013-01-22 - Version 1.5 - added ability to use terrain tags as well
#  2013-01-17 - Version 1.4 - added 'cannot board' message and optimised code
#  2012-10-24 - Version 1.3 - updated alias names for compatability
#  2012-10-18 - Version 1.2 - Added ability to specify different regions for
#                           - boat and possible to use multiple regions for each
#  2012-09-26 - Version 1.1 - Changed name from 'Galv's Port Docking'
#                           - Added landing zone region for airship
#  2012-09-26 - Version 1.0 - release
#------------------------------------------------------------------------------#
#  Specify regions that you can disembark/embark for boats, ships and airships.
#  Player can only get on or off those vehicles from the specified regions.
#
#  Instructions:
#  Specify the region numbers you want to use for each vehicle in the settings.
#  Paint the tiles you want each vehicle to be able to land/embark at with the
#  specified region numbers.
#
#------------------------------------------------------------------------------#
 
($imported ||= {})["Galv_Vehicle_On_Off"] = true
module Vehicle_On_Off
 
#------------------------------------------------------------------------------#
#  SCRIPT SETUP OPTIONS
#------------------------------------------------------------------------------#
 
  BOAT_REGIONS = [0,1]    # Ships can only land at these region and
                          # the player can only board from these region.
  BOAT_TERRAIN = []       # Can use terrain tags as well for this.
   
   
  SHIP_REGIONS = [1]      # Ships can only land at these region and
                          # the player can only board from these region.
  SHIP_TERRAIN = []       # Can use terrain tags as well for this.
   
   
  AIRSHIP_REGIONS = [2]   # Airships can only land on an airship region
  AIRSHIP_TERRAIN = []    # Can use terrain tags as well for this.
 
  # NOTES:
   
  # When no region tile is painted, it is 0
  # Terrain tags can be set in your database tilesets and are 0 by default
 
  # You can add as many regions as needed for these. For example:
  # SHIP_REGIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  # SHIP_TERRAIN = [5,6,3]
 
   
  B_MSG = "I can't board from here!"  # Message displayed when can't board.
                                      # Make this B_MSG = "" to not use this.
 
#------------------------------------------------------------------------------#
#  END SCRIPT SETUP OPTIONS
#------------------------------------------------------------------------------#
 
end
 
class Game_Vehicle < Game_Character
  alias galv_vonoff_land_ok? land_ok?
  def land_ok?(x, y, d)
    return false unless $game_map.vland?(x,y,d,@type)
    galv_vonoff_land_ok?(x, y, d)
  end
end # Game_Vehicle < Game_Character
 
class Game_Player < Game_Character
  alias galv_vonoff_get_on_vehicle get_on_vehicle
  def get_on_vehicle
    front_x = $game_map.round_x_with_direction(@x, @direction)
    front_y = $game_map.round_y_with_direction(@y, @direction)
    region = $game_map.region_id($game_player.x, $game_player.y)
    terrain = $game_map.terrain_tag($game_player.x, $game_player.y)
    board = false
    if $game_map.boat.pos?(front_x, front_y)
      board = true if Vehicle_On_Off::BOAT_REGIONS.include?(region) ||
      Vehicle_On_Off::BOAT_TERRAIN.include?(terrain)
    elsif $game_map.ship.pos?(front_x, front_y)
      board = true if Vehicle_On_Off::SHIP_REGIONS.include?(region) ||
      Vehicle_On_Off::SHIP_TERRAIN.include?(terrain)
    elsif $game_map.airship.pos?(@x, @y)
      board = true
    else
      board = nil
    end
    return vehicle_msg if board == false
    galv_vonoff_get_on_vehicle
  end
   
  def vehicle_msg
    $game_message.add(Vehicle_On_Off::B_MSG) if Vehicle_On_Off::B_MSG != ""
  end
end # Game_Player < Game_Character
 
class Game_Map
  def vland?(x,y,d,type)
    check_dir(x, y, d)
    case type
    when :boat
      regions = Vehicle_On_Off::BOAT_REGIONS
      terrain = Vehicle_On_Off::BOAT_TERRAIN
    when :ship
      regions = Vehicle_On_Off::SHIP_REGIONS
      terrain = Vehicle_On_Off::SHIP_TERRAIN
    when :airship
      regions = Vehicle_On_Off::AIRSHIP_REGIONS
      terrain = Vehicle_On_Off::AIRSHIP_TERRAIN
      @front_x = $game_player.x; @front_y = $game_player.y
    end
    regions.include?(region_id(@front_x, @front_y)) ||
    terrain.include?(terrain_tag(@front_x, @front_y))
  end
 
  def check_dir(x, y, d)
    @front_x = round_x_with_direction(x, d)
    @front_y = round_y_with_direction(y, d)
  end
end # Game_Map