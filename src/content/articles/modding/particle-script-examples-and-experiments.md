---
articleId: particle-script-examples-and-experiments
title: Particle Script Examples and Experiments
description: You can edit vanilla .pu scripts to see the code, they are located in the kenshi/data/particles/scripts folder. Please do not save over vanilla scripts.
categories:
  - Modding Guide
  - Modding
layout: modding
---

WIP

## Scripts that are working as is

You can edit vanilla .pu scripts to see the code, they are located in the kenshi/data/particles/scripts folder. Please do not save over vanilla scripts.

Click expand to see code

<table class="wikitable"><caption>Working Examples</caption><tbody><tr><td>Ridiculously Large Corpse FireFlies</td><td><details class="collapsible"><summary>Ridiculously Large Corpse FireFlies</summary><table class="wikitable"><caption></caption><tbody><tr><td><code>system Firefly<pre> <code>{
   <code>&nbsp; &nbsp; scale_velocity&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 0.03
   <code>&nbsp; &nbsp; scale&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;0.03 0.03 0.03
   <code>&nbsp; &nbsp; technique 
   <code>&nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; visual_particle_quota&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;1200
   <code>&nbsp; &nbsp; &nbsp; &nbsp; material&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; FF_kenshi_light_point
   <code>&nbsp; &nbsp; &nbsp; &nbsp; default_particle_width&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 300
   <code>&nbsp; &nbsp; &nbsp; &nbsp; default_particle_height&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;300
   <code>&nbsp; &nbsp; &nbsp; &nbsp; default_particle_depth&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 300
   <code>&nbsp; &nbsp; &nbsp; &nbsp; renderer&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Billboard
   <code>&nbsp; &nbsp; &nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; billboard_rotation_type&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;vertex
   <code>&nbsp; &nbsp; &nbsp; &nbsp; }
   <code>&nbsp; &nbsp; &nbsp; &nbsp; emitter&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Circle 
   <code>&nbsp; &nbsp; &nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; emission_rate&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;dyn_random
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; min&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;4
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; max&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;6
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; velocity&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; dyn_random
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; min&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;100
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; max&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;200
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; radius&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 1200
   <code>&nbsp; &nbsp; &nbsp; &nbsp; }
   <code>&nbsp; &nbsp; &nbsp; &nbsp; affector&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Vortex Affector
   <code>&nbsp; &nbsp; &nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; position&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 0 200 0
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; rotation_axis&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;0 0 1
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; rotation_speed&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; dyn_oscillate
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; oscillate_frequency&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;0
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; oscillate_phase&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;1
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; oscillate_base&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 1
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; oscillate_amplitude&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;-3
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; oscillate_type&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; sine
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
   <code>&nbsp; &nbsp; &nbsp; &nbsp; }
   <code>&nbsp; &nbsp; &nbsp; &nbsp; affector&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Gravity Affector
   <code>&nbsp; &nbsp; &nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; position&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 0 200 0
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; mass_affector&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;0
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; gravity&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;0
   <code>&nbsp; &nbsp; &nbsp; &nbsp; }
   <code>&nbsp; &nbsp; &nbsp; &nbsp; affector&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Randomiser Affector
   <code>&nbsp; &nbsp; &nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; max_deviation_x&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;12
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; max_deviation_y&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;12
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; max_deviation_z&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;12
   <code>&nbsp; &nbsp; &nbsp; &nbsp; }
   <code>&nbsp; &nbsp; &nbsp; &nbsp; affector&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Colour Affector
   <code>&nbsp; &nbsp; &nbsp; &nbsp; {
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; time_colour&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;0&nbsp; &nbsp; 0 0 0 0
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; time_colour&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;0.3 0.6&nbsp; &nbsp; 0.90 0.40 1
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; time_colour&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;0.4 0.71 1 0.5 1
   <code>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; time_colour&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;1&nbsp; &nbsp; 0 0 0 0
   <code>&nbsp; &nbsp; &nbsp; &nbsp; }
   <code>&nbsp; &nbsp; }
   <code>}</code>
</code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></pre><code><code><p><br></p></code></code></code></td></tr></tbody></table></details></td></tr><tr><td>row2 title</td><td><details class="collapsible"><summary>Code 2 title</summary><table class="wikitable"><caption></caption><tbody><tr><td><code></code></td></tr></tbody></table></details></td></tr><tr><td>row3 title</td><td><details class="collapsible"><summary>Code 3 title</summary><table class="wikitable"><caption></caption><tbody><tr><td><code></code></td></tr></tbody></table></details></td></tr></tbody></table>





## Scripts that have failed

Click expand to see code

<table class="wikitable"><caption>Random Experiments</caption><tbody><tr><td>Multiple Flames Per Object</td><td><details class="collapsible"><summary>Multiple Flames Per Object</summary><table class="wikitable"><caption></caption><tbody><tr><td><code>system multi_flame_fire<pre>  <code>{
   <code>   category                                     kenshi_particles
   <code>   //  Flame Source 1
   <code>   technique
  <code>    {
   <code>       material                                 kenshi_fire_flame1
   <code>       // make sure defaults are large enough
   <code>       default_particle_width   1600
   <code>       default_particle_height  1600
   <code>       default_particle_depth   1600
    <code>      renderer                                  Billboard { billboard_rotation_type vertex }
    <code>      emitter                                 SphereSurface Flame1
    <code>      {
    <code>          emission_rate       300
    <code>          angle               180
     <code>         time_to_live        dyn_random { min 0.4 max 1.2 }
     <code>         velocity            dyn_random { min 0 max 3 }
     <code>         all_particle_dimensions dyn_random { min 4000 max 8000 }
    <code>          start_colour_range  0.537255 0.14902 0.054902 1
     <code>         end_colour_range    0.9 0.4 0.2 1
     <code>         radius              0.2
     <code>         position            5 0 5
     <code>     }
     <code>     affector LinearForce { force_vector 0 50 0 }
    <code>  }
     <code> //  Flame Source 2
     <code> technique
     <code> {
     <code>     material kenshi_fire_flame1
      <code>    default_particle_width   1600
      <code>    default_particle_height  1600
      <code>    default_particle_depth   1600
      <code>    renderer Billboard { billboard_rotation_type vertex }
      <code>   emitter                                 SphereSurface Flame2
      <code>    {
       <code>       emission_rate       300
        <code>      angle               180
        <code>      time_to_live        dyn_random { min 0.4 max 1.2 }
          <code>    velocity            dyn_random { min 0 max 3 }
          <code>    all_particle_dimensions dyn_random { min 4000 max 8000 }
          <code>    start_colour_range  0.537255 0.14902 0.054902 1
          <code>    end_colour_range    0.9 0.4 0.2 1
          <code>    radius              0.2
          <code>    position            -5 0 5
       <code>   }
      <code>    affector LinearForce { force_vector 0 50 0 }
    <code>  }
    <code>  //  Flame Source 3
    <code>  technique
   <code>   {
     <code>     material                                kenshi_fire_flame1
      <code>    default_particle_width   1600
       <code>   default_particle_height  1600
       <code>   default_particle_depth   1600
       <code>   renderer Billboard { billboard_rotation_type vertex }
      <code>    emitter                                 SphereSurface Flame3
      <code>    {
          <code>    emission_rate       300
           <code>   angle               180
           <code>   time_to_live        dyn_random { min 0.4 max 1.2 }
           <code>   velocity            dyn_random { min 0 max 3 }
          <code>    all_particle_dimensions dyn_random { min 4000 max 8000 }
           <code>   start_colour_range  0.537255 0.14902 0.054902 1
            <code>  end_colour_range    0.9 0.4 0.2 1
            <code>  radius              0.2
            <code>  position            5 0 -5
         <code> }
        <code>  affector LinearForce { force_vector 0 50 0 }
     <code> }
 <code> }
 </code>
</code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></code></pre><code><code></code></code></code></td></tr></tbody></table></details></td></tr><tr><td></td><td>Multiple Flames from single source failed, cause apparently Kenshi does not allow resizing particles when they are far from the source. I tried this even with a circle emitter. In this image I have two effects set to the torch; the vanilla original (center) and my multi-particle flame script. Better result comes just adding multiple building parts to the torch, each having one effect. This way we can reduce physics clutter, but keep the multiple flames.</td></tr><tr><td>row2 title</td><td><details class="collapsible"><summary>Code 2 title</summary><table class="wikitable"><caption></caption><tbody><tr><td><code></code></td></tr></tbody></table></details></td></tr><tr><td></td><td></td></tr><tr><td>row3 title</td><td><details class="collapsible"><summary>Code 3 title</summary><table class="wikitable"><caption></caption><tbody><tr><td><code></code></td></tr></tbody></table></details></td></tr></tbody></table>







<table class="wikitable"><caption>⧼visualeditor-table-caption⧽</caption><tbody><tr><th>Header cell</th><th>Header cell</th></tr><tr><td>Content cell</td><td>Content cell</td></tr></tbody></table>
