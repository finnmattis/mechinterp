from manim import *
import numpy as np

class ResidualVectorQuantization(Scene):
    def construct(self):
        # Configuration
        grid_size = 4  # 4x4 grid
        num_iterations = 4
        canvas_width = 8
        canvas_height = 8
        
        # Set up colors
        colors = {
            "grid": LIGHT_GREY,
            "original": RED,
            "quantized": BLUE,
            "approximation": GREEN,
            "residual": GOLD,
            "background": BLACK
        }
        
        # Set up the main coordinate system
        axes = Axes(
            x_range=[-0.5, grid_size - 0.5, 1],
            y_range=[-0.5, grid_size - 0.5, 1],
            x_length=canvas_width,
            y_length=canvas_height,
            axis_config={"include_tip": False, "include_numbers": False, "color": GREY},
        )
        
        # Create grid
        grid_lines = VGroup()
        for i in range(grid_size + 1):
            # Vertical lines
            grid_lines.add(Line(
                axes.c2p(i - 0.5, -0.5),
                axes.c2p(i - 0.5, grid_size - 0.5),
                color=colors["grid"], stroke_width=1
            ))
            # Horizontal lines
            grid_lines.add(Line(
                axes.c2p(-0.5, i - 0.5),
                axes.c2p(grid_size - 0.5, i - 0.5),
                color=colors["grid"], stroke_width=1
            ))
        
        # Create grid points
        grid_points = VGroup()
        for x in range(grid_size):
            for y in range(grid_size):
                grid_points.add(Dot(
                    axes.c2p(x, y),
                    color=colors["grid"],
                    radius=0.05
                ))
        
        # Title and iteration counter
        title = Text("Residual Vector Quantization", font_size=36)
        title.to_edge(UP)
        
        iteration_counter = Text("Iteration: 1/" + str(num_iterations), font_size=24)
        iteration_counter.to_edge(DOWN)
        
        # Starting layout
        self.play(
            FadeIn(title),
            Create(axes),
            Create(grid_lines),
            FadeIn(grid_points),
            FadeIn(iteration_counter)
        )
        
        self.wait(1)
        
        # Create original vector at a non-grid position
        original_pos = np.array([2.7, 1.8])  # Choose a position that's not on a grid point
        original_dot = Dot(axes.c2p(original_pos[0], original_pos[1]), color=colors["original"], radius=0.1)
        original_label = Text("Original Vector", font_size=20, color=colors["original"])
        original_label.next_to(original_dot, UP)
        
        self.play(
            FadeIn(original_dot),
            FadeIn(original_label)
        )
        
        self.wait(1)
        
        # Perform quantization iterations
        current_vector = original_pos
        approximation = np.array([0.0, 0.0])
        approximation_dot = None
        
        for iteration in range(num_iterations):
            # Update iteration counter
            new_counter = Text(f"Iteration: {iteration + 1}/{num_iterations}", font_size=24)
            new_counter.to_edge(DOWN)
            self.play(Transform(iteration_counter, new_counter))
            
            # Find nearest grid point (quantize)
            nearest_grid = np.round(current_vector)
            nearest_grid_point = Dot(axes.c2p(nearest_grid[0], nearest_grid[1]), color=colors["quantized"], radius=0.08)
            
            # Animation to show finding the nearest point
            dashed_line = DashedLine(
                axes.c2p(current_vector[0], current_vector[1]),
                axes.c2p(nearest_grid[0], nearest_grid[1]),
                color=colors["quantized"],
                dash_length=0.15
            )
            
            quantized_label = Text(f"Quantized {iteration + 1}", font_size=16, color=colors["quantized"])
            quantized_label.next_to(nearest_grid_point, UP + RIGHT)
            
            # Show the quantization
            self.play(
                Create(dashed_line),
                FadeIn(nearest_grid_point),
                FadeIn(quantized_label)
            )
            
            self.wait(0.5)
            
            # Update approximation
            approximation = approximation + nearest_grid
            
            if approximation_dot:
                self.play(FadeOut(approximation_dot))
            
            approximation_dot = Dot(axes.c2p(approximation[0], approximation[1]), color=colors["approximation"], radius=0.09)
            approximation_label = Text("Current Approximation", font_size=18, color=colors["approximation"])
            approximation_label.next_to(approximation_dot, DOWN)
            
            self.play(
                FadeIn(approximation_dot),
                FadeIn(approximation_label)
            )
            
            self.wait(0.5)
            
            # Calculate residual
            residual = original_pos - approximation
            
            residual_arrow = Arrow(
                axes.c2p(approximation[0], approximation[1]),
                axes.c2p(original_pos[0], original_pos[1]),
                color=colors["residual"],
                buff=0.1
            )
            
            residual_label = Text("Residual", font_size=18, color=colors["residual"])
            residual_label.next_to(residual_arrow, RIGHT)
            
            self.play(
                Create(residual_arrow),
                FadeIn(residual_label)
            )
            
            self.wait(0.5)
            
            # Set residual as the new vector for next iteration
            if iteration < num_iterations - 1:  # Skip creating a new dot for the last iteration
                current_vector = residual
                current_dot = Dot(axes.c2p(current_vector[0], current_vector[1]), color=colors["residual"], radius=0.08)
                
                # Zooming effect for next iteration (except for the last one)
                zoom_circle = Circle(radius=1, color=colors["residual"])
                zoom_circle.move_to(axes.c2p(current_vector[0], current_vector[1]))
                
                self.play(
                    Create(zoom_circle),
                    FadeIn(current_dot)
                )
                
                # Draw mini grid around the residual
                mini_grid_lines = VGroup()
                mini_grid_size = 0.5
                
                for i in range(-2, 3):
                    for j in range(-2, 3):
                        # Create mini grid points around the residual
                        mini_point = Dot(
                            axes.c2p(current_vector[0] + i * mini_grid_size/2, current_vector[1] + j * mini_grid_size/2),
                            color=colors["grid"],
                            radius=0.02
                        )
                        mini_grid_lines.add(mini_point)
                
                self.play(FadeIn(mini_grid_lines))
                self.wait(0.5)
                
                # Clean up before next iteration
                self.play(
                    FadeOut(zoom_circle),
                    FadeOut(mini_grid_lines),
                    FadeOut(residual_arrow),
                    FadeOut(residual_label),
                    FadeOut(quantized_label),
                    FadeOut(approximation_label),
                )
        
        # Final state - show the complete approximation
        final_label = Text("Final Approximation", font_size=24, color=colors["approximation"])
        final_label.to_edge(DOWN)
        
        self.play(
            Transform(iteration_counter, final_label),
            approximation_dot.animate.set_color(GREEN_A).scale(1.5)
        )
        
        self.wait(1)
        
        # Show the error
        error_value = np.linalg.norm(original_pos - approximation)
        error_text = Text(f"Error: {error_value:.3f}", font_size=24)
        error_text.next_to(final_label, DOWN)
        
        self.play(FadeIn(error_text))
        
        self.wait(2)
        
        # Cleanup and final message
        conclusion = Text("Residual Vector Quantization", font_size=36)
        conclusion.to_edge(UP)
        
        description = Text("Progressive refinement through residual quantization", font_size=24)
        description.next_to(conclusion, DOWN)
        
        self.play(
            FadeOut(VGroup(axes, grid_lines, grid_points, original_dot, original_label, 
                          nearest_grid_point, approximation_dot, error_text)),
            Transform(title, conclusion),
            FadeIn(description),
            FadeOut(iteration_counter)
        )
        
        self.wait(2)


